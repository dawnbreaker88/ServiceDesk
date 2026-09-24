import { AiSession } from '../models/AiSession.js';
import { TroubleshootingGuide } from '../models/TroubleshootingGuide.js';
import { Category } from '../models/Category.js';
import { Asset } from '../models/Asset.js';
import { Department } from '../models/Department.js';
import { Ticket } from '../models/Ticket.js';
import { generateNextTicketNumber } from '../utils/ticketNumber.js';
import { calculateSlaDeadlines } from '../utils/slaCalculator.js';
import { recordAuditLog } from '../utils/audit.js';
import { notifyRoleUsers } from '../utils/notificationHelper.js';
import { aiService } from '../services/aiService.js';

/**
 * Intelligent keyword and symptom matcher
 */
const findBestGuide = async (text) => {
  const guides = await TroubleshootingGuide.find({ active: true }).populate('category', 'name code');
  if (!guides.length) return null;

  const lowerText = text.toLowerCase();

  let bestMatch = null;
  let highestScore = 0;

  for (const guide of guides) {
    let score = 0;
    // Check guide title
    const titleWords = guide.title.toLowerCase().split(/\s+/);
    for (const w of titleWords) {
      if (w.length > 3 && lowerText.includes(w)) score += 3;
    }

    // Check symptoms
    for (const symptom of guide.symptoms) {
      if (lowerText.includes(symptom.toLowerCase())) {
        score += 5;
      }
      const sWords = symptom.toLowerCase().split(/\s+/);
      for (const sw of sWords) {
        if (sw.length > 3 && lowerText.includes(sw)) score += 2;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = guide;
    }
  }

  // Threshold score
  return highestScore >= 2 ? bestMatch : null;
};

// Helper to detect if user wants to file/escalate a ticket
const isTicketIntent = (text = '') => {
  const lower = text.toLowerCase().trim();
  const patterns = [
    /create\s*(a\s*)?ticket/i,
    /file\s*(a\s*)?ticket/i,
    /open\s*(a\s*)?ticket/i,
    /submit\s*(a\s*)?ticket/i,
    /send\s*(a\s*)?ticket/i,
    /escalat/i,
    /talk to (a )?human/i,
    /talk to (an? )?it/i,
    /speak with (a )?tech/i,
    /need (a )?technician/i,
    /send to it/i,
    /raise (a )?ticket/i,
  ];
  return patterns.some((p) => p.test(lower));
};

// @desc    AI Support Assistant Chat (Interactive Troubleshooting)
// @route   POST /api/ai/chat
// @access  Private
export const aiChat = async (req, res) => {
  const { sessionId, message, action } = req.body;

  if (!message && !action) {
    return res.status(400).json({ success: false, message: 'Message or action is required.' });
  }

  let session;
  if (sessionId) {
    session = await AiSession.findById(sessionId).populate('matchedGuide').populate('category');
  }

  if (!session) {
    session = await AiSession.create({
      user: req.user._id,
      problemDescription: message || '',
      messages: [
        {
          role: 'user',
          content: message || 'Starting support session',
        },
      ],
    });
  } else if (message) {
    session.messages.push({
      role: 'user',
      content: message,
    });
  }

  // Handle Action: SOLVED
  if (action === 'SOLVED') {
    session.status = 'RESOLVED';
    const resolvedMsg = {
      role: 'assistant',
      content: 'Glad to hear that fixed the problem. Feel free to reach out anytime if you experience any other technical issues.',
    };
    session.messages.push(resolvedMsg);
    await session.save();

    return res.status(200).json({
      success: true,
      sessionId: session._id,
      status: 'RESOLVED',
      response: resolvedMsg,
    });
  }

  // Check if action or message triggers Ticket Escalation
  const wantsTicket = action === 'ESCALATE_TICKET' || (message && isTicketIntent(message));

  if (wantsTicket) {
    session.status = 'ESCALATED';

    const userAssets = await Asset.find({ assignedUser: req.user._id, status: 'ASSIGNED' });
    const categories = await Category.find({ status: 'ACTIVE' });

    // Derive suggested title & priority from conversation
    let suggestedTitle = session.problemDescription || 'IT Support Assistance';
    if (suggestedTitle.length > 75) suggestedTitle = suggestedTitle.slice(0, 72) + '...';

    const guide = session.matchedGuide || (await findBestGuide(session.problemDescription + ' ' + (message || '')));
    let suggestedCat = session.category || guide?.category || categories[0];
    let suggestedPriority = guide?.suggestedPriority || 'MEDIUM';

    // Synthesize structured technician ticket description from the conversation
    let suggestedDescription = '';
    if (aiService.hasApiKey()) {
      const conversationToPass = session.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      suggestedDescription = await aiService.generateEscalationSummary(conversationToPass);
    }

    if (!suggestedDescription) {
      suggestedDescription = `### Problem Summary\n${session.problemDescription || message || 'Issue requiring IT assistance'}\n\n### Symptoms Observed\n- ${session.problemDescription || message || 'User reported technical issue'}\n\n### Recommended Technician Action\nInvestigate workstation diagnostics and assist employee.`;
    }

    const reply = {
      role: 'assistant',
      content: `I will prepare an IT Support ticket with the diagnostic details from our conversation. Please review the ticket details below and submit when ready.`,
    };
    session.messages.push(reply);
    await session.save();

    return res.status(200).json({
      success: true,
      sessionId: session._id,
      status: 'ESCALATED',
      canCreateTicket: true,
      suggestedTitle,
      suggestedDescription,
      suggestedCategory: suggestedCat,
      suggestedPriority,
      userAssets,
      response: reply,
    });
  }

  // Find guide if not already linked
  let guide = session.matchedGuide;
  if (!guide) {
    guide = await findBestGuide(message || session.problemDescription);
    if (guide) {
      session.matchedGuide = guide._id;
      session.category = guide.category;
    }
  }

  // 1. If LLM Provider is configured with API key (Groq, Gemini, OpenAI, Ollama), generate real AI dialogue
  if (aiService.hasApiKey()) {
    const userAssets = await Asset.find({ assignedUser: req.user._id, status: 'ASSIGNED' });
    const assetInfo = userAssets.map((a) => `${a.name} (Tag: ${a.assetTag || 'N/A'}, Model: ${a.model || 'Standard'})`).join(', ') || 'None assigned';
    let deptName = 'General Staff';
    if (req.user.department) {
      const d = await Department.findById(req.user.department);
      if (d) deptName = d.name;
    }

    let dynamicContext = `EMPLOYEE CONTEXT:\n- Name: ${req.user.name}\n- Department: ${deptName}\n- Assigned Company Devices: ${assetInfo}\n`;

    if (guide) {
      dynamicContext += `\nRELEVANT INTERNAL KNOWLEDGE GUIDE: "${guide.title}"\nSymptoms: ${guide.symptoms?.join(', ')}\nStep-by-step diagnostic guide:\n${guide.steps?.map((s) => `${s.stepNumber}. ${s.instruction} (${s.details || ''})`).join('\n')}`;
    }

    const conversationToPass = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const llmReply = await aiService.generateChatResponse(conversationToPass, dynamicContext);
    if (llmReply) {
      const replyObj = {
        role: 'assistant',
        content: llmReply,
      };
      session.messages.push(replyObj);
      await session.save();

      return res.status(200).json({
        success: true,
        sessionId: session._id,
        status: session.status,
        provider: aiService.provider,
        response: replyObj,
      });
    }
  }

  // 2. Intelligent Built-in Conversational Support Engine (Multi-turn aware)
  const turnCount = session.messages.filter((m) => m.role === 'user').length;
  const userText = (message || '').toLowerCase();

  // If user says "no" or "still broken"
  if (userText.includes('no') || userText.includes('not working') || userText.includes('still') || action === 'NEXT_STEP') {
    const steps = guide?.steps || [];
    const nextIdx = (session.currentStepIndex || 0) + 1;
    session.currentStepIndex = nextIdx;

    if (steps.length > 0 && nextIdx <= steps.length) {
      const step = steps[nextIdx - 1];
      const reply = {
        role: 'assistant',
        content: `Understood. Please try the next troubleshooting step:\n\n**Step ${step.stepNumber}: ${step.instruction}**\n\n${step.details || ''}\n\nLet me know if this resolves the issue or if you would like to escalate to an official IT ticket.`,
      };
      session.messages.push(reply);
      await session.save();

      return res.status(200).json({
        success: true,
        sessionId: session._id,
        status: session.status,
        response: reply,
      });
    }
  }

  // Initial diagnosis response
  if (guide) {
    session.currentStepIndex = 1;
    const firstStep = guide.steps?.[0];
    const diagQuestion = guide.diagnosticQuestions?.[0]?.question;

    let responseContent = `I understand you are experiencing an issue with **${guide.title}**.\n\n`;
    if (diagQuestion && turnCount <= 1) {
      responseContent += `${diagQuestion}\n\n`;
    }
    if (firstStep) {
      responseContent += `**Initial Recommended Step (${firstStep.stepNumber})**: ${firstStep.instruction}\n\n${firstStep.details || ''}`;
    }

    const reply = {
      role: 'assistant',
      content: responseContent,
    };
    session.messages.push(reply);
    await session.save();

    return res.status(200).json({
      success: true,
      sessionId: session._id,
      status: session.status,
      response: reply,
    });
  }

  // General conversational assistance
  const generalReply = {
    role: 'assistant',
    content: `I have analyzed your description: "${message || session.problemDescription}".\n\nTo help isolate this problem:\n1. When did this first start occurring?\n2. Does restarting the device or application resolve it?\n\nIf you prefer to submit a ticket for technician review, you can ask me to "create ticket" or use the manual option above.`,
  };
  session.messages.push(generalReply);
  await session.save();

  return res.status(200).json({
    success: true,
    sessionId: session._id,
    status: session.status,
    response: generalReply,
  });
};

// @desc    AI Ticket Classification & Categorization Suggestion
// @route   POST /api/ai/classify
// @access  Private
export const aiClassify = async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ success: false, message: 'Text is required for classification.' });
  }

  // 1. If LLM API Key is provided, use real LLM categorization
  if (aiService.hasApiKey()) {
    const llmResult = await aiService.classifyTicket(text);
    if (llmResult && llmResult.category) {
      const categories = await Category.find({ status: 'ACTIVE' });
      const matchedCat = categories.find(
        (c) => c.name.toUpperCase().includes(llmResult.category.toUpperCase()) || c.code === llmResult.category.toUpperCase()
      ) || categories[0];

      return res.status(200).json({
        success: true,
        provider: aiService.provider,
        data: {
          category: matchedCat,
          priority: llmResult.priority || 'MEDIUM',
          probableIssue: llmResult.probableIssue || 'AI Detected Issue',
          recommendedAction: llmResult.recommendedAction || '',
          confidence: 0.98,
        },
      });
    }
  }

  // 2. Built-in fallback rule engine
  const guide = await findBestGuide(text);
  const categories = await Category.find({ status: 'ACTIVE' });

  let selectedCategory = categories.find((c) => c.code === 'HW') || categories[0];
  let priority = 'MEDIUM';
  let probableIssue = 'General IT Inquiry';

  const lower = text.toLowerCase();

  if (guide) {
    selectedCategory = guide.category;
    priority = guide.suggestedPriority || 'MEDIUM';
    probableIssue = guide.title;
  } else if (lower.includes('wifi') || lower.includes('network') || lower.includes('vpn') || lower.includes('internet')) {
    selectedCategory = categories.find((c) => c.code === 'NET') || selectedCategory;
    probableIssue = 'Network / Connectivity Issue';
    priority = lower.includes('outage') || lower.includes('all users') ? 'CRITICAL' : 'HIGH';
  } else if (lower.includes('password') || lower.includes('locked') || lower.includes('access') || lower.includes('permission')) {
    selectedCategory = categories.find((c) => c.code === 'ACCESS') || selectedCategory;
    probableIssue = 'Authentication / Access Control';
    priority = 'HIGH';
  } else if (lower.includes('bsod') || lower.includes('crash') || lower.includes('broken') || lower.includes('laptop') || lower.includes('screen')) {
    selectedCategory = categories.find((c) => c.code === 'HW') || selectedCategory;
    probableIssue = 'Hardware Failure / OS Crash';
    priority = lower.includes('bsod') || lower.includes('dead') ? 'CRITICAL' : 'HIGH';
  } else if (lower.includes('license') || lower.includes('software') || lower.includes('adobe') || lower.includes('install')) {
    selectedCategory = categories.find((c) => c.code === 'SW') || selectedCategory;
    probableIssue = 'Software Installation / Licensing';
    priority = 'MEDIUM';
  }

  res.status(200).json({
    success: true,
    data: {
      category: selectedCategory,
      priority,
      probableIssue,
      confidence: guide ? 0.95 : 0.82,
    },
  });
};

// @desc    Escalate AI Session to Formal Ticket Creation
// @route   POST /api/ai/escalate
// @access  Private
export const aiEscalate = async (req, res) => {
  const { sessionId, title, description, categoryId, priority = 'MEDIUM', assetId } = req.body;

  let session;
  if (sessionId) {
    session = await AiSession.findById(sessionId);
  }

  const finalTitle = title || session?.problemDescription || 'Support Request';
  let fullDescription = description;

  if (!fullDescription && session && session.messages && session.messages.length) {
    if (aiService.hasApiKey()) {
      const convo = session.messages.map((m) => ({ role: m.role, content: m.content }));
      fullDescription = await aiService.generateEscalationSummary(convo);
    }
  }

  if (!fullDescription) {
    fullDescription = session?.problemDescription || 'Support request submitted via AI Assistant.';
  }

  let finalCategory = categoryId;
  if (!finalCategory) {
    const defaultCat = await Category.findOne({ status: 'ACTIVE' });
    finalCategory = defaultCat?._id;
  }

  const ticketNumber = await generateNextTicketNumber();
  const slaInfo = await calculateSlaDeadlines(priority);

  const ticket = await Ticket.create({
    ticketNumber,
    title: finalTitle,
    description: fullDescription,
    requester: req.user._id,
    department: req.user.department || null,
    category: finalCategory,
    priority,
    status: 'OPEN',
    asset: assetId || null,
    slaPolicy: slaInfo.slaPolicyId,
    responseDeadline: slaInfo.responseDeadline,
    resolutionDeadline: slaInfo.resolutionDeadline,
    source: 'AI_ASSISTANT',
    tags: ['ai-escalated'],
  });

  if (session) {
    session.status = 'ESCALATED';
    session.createdTicket = ticket._id;
    await session.save();
  }

  await recordAuditLog({
    actor: req.user,
    action: 'TICKET_CREATED',
    entity: 'Ticket',
    entityId: ticket._id,
    newState: { ticketNumber, status: 'OPEN', source: 'AI_ASSISTANT' },
    details: `Ticket ${ticketNumber} created via AI Assistant escalation.`,
  });

  await notifyRoleUsers({
    role: 'MANAGER',
    type: 'SYSTEM',
    title: `AI Escalated Ticket: ${ticketNumber}`,
    message: `${req.user.name} created ticket "${finalTitle}" via AI Assistant.`,
    relatedEntity: 'Ticket',
    relatedId: ticket._id,
  });

  const populated = await Ticket.findById(ticket._id)
    .populate('requester', 'name email department avatar')
    .populate('category', 'name code icon')
    .populate('asset');

  res.status(201).json({
    success: true,
    message: `Support ticket ${ticketNumber} successfully submitted!`,
    data: populated,
  });
};

// @desc    Get user's AI session history
// @route   GET /api/ai/sessions
// @access  Private
export const getAiSessions = async (req, res) => {
  const sessions = await AiSession.find({ user: req.user._id })
    .populate('category', 'name code')
    .populate('createdTicket', 'ticketNumber title status')
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    count: sessions.length,
    data: sessions,
  });
};

// @desc    Get AI Provider & Model Configuration (Admin)
// @route   GET /api/ai/config
// @access  Private (Admin)
export const getAiConfig = async (req, res) => {
  const provider = process.env.AI_PROVIDER || 'groq';
  const model = process.env.AI_MODEL || 'openai/gpt-oss-120b';
  const hasApiKey = Boolean(process.env.AI_API_KEY && process.env.AI_API_KEY !== 'your_groq_api_key_here');

  res.status(200).json({
    success: true,
    data: {
      provider,
      model,
      configured: hasApiKey,
      status: hasApiKey ? 'ACTIVE' : 'FALLBACK_ONLY',
      baseUrl: process.env.AI_BASE_URL || 'Default Endpoint',
    },
  });
};

// @desc    Test Live AI Connection & Latency (Admin)
// @route   POST /api/ai/test
// @access  Private (Admin)
export const testAiConnection = async (req, res) => {
  const startTime = Date.now();
  try {
    const result = await aiService.complete([
      { role: 'system', content: 'You are the ServiceDesk AI Diagnostic engine. Reply with a short JSON confirmation: {"status": "ONLINE", "message": "ServiceDesk AI operational."}' },
      { role: 'user', content: 'Ping test' },
    ]);

    const latencyMs = Date.now() - startTime;

    res.status(200).json({
      success: true,
      latencyMs,
      provider: process.env.AI_PROVIDER || 'groq',
      model: process.env.AI_MODEL || 'openai/gpt-oss-120b',
      response: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      latencyMs: Date.now() - startTime,
      message: err.message || 'AI Connection Test Failed',
    });
  }
};

