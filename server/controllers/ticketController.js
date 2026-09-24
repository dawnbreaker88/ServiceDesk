import { Ticket } from '../models/Ticket.js';
import { Comment } from '../models/Comment.js';
import { WorkLog } from '../models/WorkLog.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';
import { generateNextTicketNumber } from '../utils/ticketNumber.js';
import { calculateSlaDeadlines } from '../utils/slaCalculator.js';
import { recordAuditLog } from '../utils/audit.js';
import { createNotification, notifyRoleUsers } from '../utils/notificationHelper.js';
import { emitEvent } from '../socket.js';

// @desc    Get tickets with scoping, filtering, and pagination
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    priority,
    category,
    department,
    assignee,
    requester,
    slaStatus,
    source,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    myTickets, // if true, filters to user's tickets
  } = req.query;

  const query = {};

  // Role Scoping: Regular Employees can ONLY see their own tickets
  if (req.user.role === 'EMPLOYEE' || myTickets === 'true') {
    query.requester = req.user._id;
  } else if (req.user.role === 'TECHNICIAN' && req.query.assignedToMe === 'true') {
    query.assignee = req.user._id;
  }

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (department) query.department = department;
  if (assignee && req.user.role !== 'EMPLOYEE') query.assignee = assignee;
  if (requester && req.user.role !== 'EMPLOYEE') query.requester = requester;
  if (slaStatus) query.slaStatus = slaStatus;
  if (source) query.source = source;

  if (search) {
    query.$or = [
      { ticketNumber: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await Ticket.countDocuments(query);
  const tickets = await Ticket.find(query)
    .populate('requester', 'name email department avatar')
    .populate('assignee', 'name email avatar')
    .populate('department', 'name code')
    .populate('category', 'name code icon')
    .populate('asset', 'assetTag name model serialNumber status')
    .populate('slaPolicy')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    count: tickets.length,
    data: tickets,
  });
};

// @desc    Get single ticket by ID with comments, worklogs, and audit trail
// @route   GET /api/tickets/:id
// @access  Private
export const getTicketById = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('requester', 'name email department avatar phone')
    .populate('assignee', 'name email avatar phone')
    .populate('department', 'name code')
    .populate('category', 'name code icon')
    .populate('asset')
    .populate('slaPolicy');

  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  // Scoping check for employees
  if (req.user.role === 'EMPLOYEE' && ticket.requester._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this ticket.' });
  }

  // Comments Query (Hide internal notes from regular employees)
  const commentQuery = { ticket: ticket._id };
  if (req.user.role === 'EMPLOYEE') {
    commentQuery.isInternal = false;
  }

  const comments = await Comment.find(commentQuery)
    .populate('author', 'name email role avatar')
    .sort({ createdAt: 1 });

  // Worklogs (IT staff only)
  let workLogs = [];
  if (req.user.role !== 'EMPLOYEE') {
    workLogs = await WorkLog.find({ ticket: ticket._id })
      .populate('technician', 'name email avatar')
      .sort({ createdAt: -1 });
  }

  // Audit Logs
  const auditLogs = await AuditLog.find({ entity: 'Ticket', entityId: ticket._id }).sort({ timestamp: 1 });

  res.status(200).json({
    success: true,
    data: {
      ...ticket.toObject(),
      comments,
      workLogs,
      auditLogs,
    },
  });
};

// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (req, res) => {
  const { title, description, category, priority = 'MEDIUM', asset, department, attachments, source = 'MANUAL', tags } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({
      success: false,
      message: 'Title, description, and category are required to create a ticket.',
    });
  }

  const ticketNumber = await generateNextTicketNumber();
  const slaInfo = await calculateSlaDeadlines(priority);

  const requesterId = req.user._id;
  const deptId = department || req.user.department || null;

  const ticket = await Ticket.create({
    ticketNumber,
    title,
    description,
    requester: requesterId,
    department: deptId,
    category,
    priority,
    status: 'OPEN',
    asset: asset || null,
    slaPolicy: slaInfo.slaPolicyId,
    responseDeadline: slaInfo.responseDeadline,
    resolutionDeadline: slaInfo.resolutionDeadline,
    source,
    attachments: attachments || [],
    tags: tags || [],
  });

  // Populate references for response
  const populated = await Ticket.findById(ticket._id)
    .populate('requester', 'name email department avatar')
    .populate('department', 'name code')
    .populate('category', 'name code icon')
    .populate('asset');

  // Record audit log
  await recordAuditLog({
    actor: req.user,
    action: 'TICKET_CREATED',
    entity: 'Ticket',
    entityId: ticket._id,
    newState: { ticketNumber, title, priority, status: 'OPEN' },
    details: `Ticket ${ticketNumber} created by ${req.user.name} via ${source}`,
  });

  // Notify IT Managers
  await notifyRoleUsers({
    role: 'MANAGER',
    type: 'SYSTEM',
    title: `New Ticket Created: ${ticketNumber}`,
    message: `${req.user.name} submitted ticket "${title}" with priority ${priority}.`,
    relatedEntity: 'Ticket',
    relatedId: ticket._id,
  });

  emitEvent('ticket:created', populated);

  res.status(201).json({
    success: true,
    message: 'Ticket created successfully',
    data: populated,
  });
};

// @desc    Update ticket details (title, description, priority, category, asset)
// @route   PATCH /api/tickets/:id
// @access  Private
export const updateTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const isRequester = ticket.requester.toString() === req.user._id.toString();
  const isItStaffMember = ['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(req.user.role);

  if (!isRequester && !isItStaffMember) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this ticket.' });
  }

  const { title, description, category, priority, asset, tags } = req.body;
  const previousState = { priority: ticket.priority, title: ticket.title };

  if (title) ticket.title = title;
  if (description) ticket.description = description;
  if (category) ticket.category = category;
  if (asset !== undefined) ticket.asset = asset || null;
  if (tags) ticket.tags = tags;

  // If priority changed, recalculate SLA deadlines
  if (priority && priority !== ticket.priority) {
    ticket.priority = priority;
    const slaInfo = await calculateSlaDeadlines(priority, ticket.createdAt);
    ticket.slaPolicy = slaInfo.slaPolicyId;
    ticket.responseDeadline = slaInfo.responseDeadline;
    ticket.resolutionDeadline = slaInfo.resolutionDeadline;
  }

  await ticket.save();

  await recordAuditLog({
    actor: req.user,
    action: 'TICKET_UPDATED',
    entity: 'Ticket',
    entityId: ticket._id,
    previousState,
    newState: { priority: ticket.priority, title: ticket.title },
    details: `Ticket ${ticket.ticketNumber} details updated by ${req.user.name}`,
  });

  const updated = await Ticket.findById(ticket._id)
    .populate('requester', 'name email department avatar')
    .populate('assignee', 'name email avatar')
    .populate('department', 'name code')
    .populate('category', 'name code icon')
    .populate('asset');

  emitEvent('ticket:updated', updated);
  emitEvent('ticket:updated', updated, `ticket:${ticket._id}`);

  res.status(200).json({
    success: true,
    message: 'Ticket updated successfully',
    data: updated,
  });
};

// @desc    Assign ticket to a technician
// @route   POST /api/tickets/:id/assign
// @access  Private (Manager or Admin)
export const assignTicket = async (req, res) => {
  const { technicianId } = req.body;

  if (!technicianId) {
    return res.status(400).json({ success: false, message: 'Technician ID is required.' });
  }

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const tech = await User.findById(technicianId);
  if (!tech || tech.status !== 'ACTIVE' || !['TECHNICIAN', 'MANAGER', 'ADMIN'].includes(tech.role)) {
    return res.status(400).json({
      success: false,
      message: 'Selected user is not an active technician.',
    });
  }

  const previousAssignee = ticket.assignee;
  ticket.assignee = tech._id;
  if (ticket.status === 'OPEN') {
    ticket.status = 'ASSIGNED';
  }

  await ticket.save();

  await recordAuditLog({
    actor: req.user,
    action: 'TICKET_ASSIGNED',
    entity: 'Ticket',
    entityId: ticket._id,
    previousState: { assignee: previousAssignee },
    newState: { assignee: tech.name, status: ticket.status },
    details: `Ticket ${ticket.ticketNumber} assigned to ${tech.name} by ${req.user.name}`,
  });

  // Notify technician
  await createNotification({
    recipientId: tech._id,
    type: 'TICKET_ASSIGNED',
    title: `Assigned: ${ticket.ticketNumber}`,
    message: `You were assigned ticket "${ticket.title}".`,
    relatedEntity: 'Ticket',
    relatedId: ticket._id,
  });

  const updated = await Ticket.findById(ticket._id)
    .populate('requester', 'name email department avatar')
    .populate('assignee', 'name email avatar')
    .populate('department', 'name code')
    .populate('category', 'name code icon');

  emitEvent('ticket:assigned', updated);
  emitEvent('ticket:updated', updated, `ticket:${ticket._id}`);

  res.status(200).json({
    success: true,
    message: `Ticket assigned to ${tech.name}`,
    data: updated,
  });
};

// @desc    Start work on ticket (Technician)
// @route   POST /api/tickets/:id/start
// @access  Private (Technician, Manager, Admin)
export const startTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  // If unassigned and clicked by technician, assign to self
  if (!ticket.assignee) {
    ticket.assignee = req.user._id;
  }

  ticket.status = 'IN_PROGRESS';
  if (!ticket.firstResponseAt) {
    ticket.firstResponseAt = new Date();
  }

  await ticket.save();

  await recordAuditLog({
    actor: req.user,
    action: 'TICKET_STARTED',
    entity: 'Ticket',
    entityId: ticket._id,
    newState: { status: 'IN_PROGRESS' },
    details: `Work started on ${ticket.ticketNumber} by ${req.user.name}`,
  });

  const updated = await Ticket.findById(ticket._id)
    .populate('requester', 'name email department avatar')
    .populate('assignee', 'name email avatar')
    .populate('department', 'name code')
    .populate('category', 'name code icon');

  emitEvent('ticket:updated', updated);
  emitEvent('ticket:updated', updated, `ticket:${ticket._id}`);

  res.status(200).json({
    success: true,
    message: 'Ticket status changed to IN_PROGRESS',
    data: ticket,
  });
};

// @desc    Add comment / note to ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  const { message, isInternal = false, attachments = [] } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ success: false, message: 'Comment message cannot be empty.' });
  }

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const isEmployee = req.user.role === 'EMPLOYEE';
  // Employees cannot create internal notes
  const internalFlag = isEmployee ? false : Boolean(isInternal);

  const comment = await Comment.create({
    ticket: ticket._id,
    author: req.user._id,
    message,
    isInternal: internalFlag,
    attachments,
  });

  // If this is IT staff responding and first response not set, mark it
  if (!isEmployee && !ticket.firstResponseAt) {
    ticket.firstResponseAt = new Date();
    await ticket.save();
  }

  const populatedComment = await Comment.findById(comment._id).populate('author', 'name email role avatar');

  // Send notifications
  if (isEmployee) {
    // Notify assignee or managers
    if (ticket.assignee) {
      await createNotification({
        recipientId: ticket.assignee,
        type: 'NEW_COMMENT',
        title: `New Comment on ${ticket.ticketNumber}`,
        message: `${req.user.name}: "${message.slice(0, 80)}..."`,
        relatedEntity: 'Ticket',
        relatedId: ticket._id,
      });
    }
  } else if (!internalFlag) {
    // IT staff posted public comment -> notify requester
    await createNotification({
      recipientId: ticket.requester,
      type: 'NEW_COMMENT',
      title: `IT Update on ${ticket.ticketNumber}`,
      message: `${req.user.name}: "${message.slice(0, 80)}..."`,
      relatedEntity: 'Ticket',
      relatedId: ticket._id,
    });
  }

  emitEvent('ticket:comment', { ticketId: ticket._id, comment: populatedComment });
  emitEvent('ticket:comment', { ticketId: ticket._id, comment: populatedComment }, `ticket:${ticket._id}`);

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: populatedComment,
  });
};

// @desc    Add work log
// @route   POST /api/tickets/:id/worklogs
// @access  Private (Technician, Manager, Admin)
export const addWorkLog = async (req, res) => {
  const { description, durationMinutes, startTime, endTime } = req.body;

  if (!description || !durationMinutes) {
    return res.status(400).json({
      success: false,
      message: 'Description and duration in minutes are required.',
    });
  }

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const workLog = await WorkLog.create({
    ticket: ticket._id,
    technician: req.user._id,
    description,
    durationMinutes: Number(durationMinutes),
    startTime: startTime || new Date(Date.now() - durationMinutes * 60 * 1000),
    endTime: endTime || new Date(),
  });

  if (ticket.status === 'ASSIGNED' || ticket.status === 'OPEN') {
    ticket.status = 'IN_PROGRESS';
    if (!ticket.firstResponseAt) ticket.firstResponseAt = new Date();
    await ticket.save();
  }

  const populated = await WorkLog.findById(workLog._id).populate('technician', 'name email avatar');

  emitEvent('ticket:worklog', { ticketId: ticket._id, workLog: populated }, `ticket:${ticket._id}`);

  res.status(201).json({
    success: true,
    message: 'Work log recorded successfully',
    data: populated,
  });
};

// @desc    Resolve ticket (Technician or Manager)
// @route   POST /api/tickets/:id/resolve
// @access  Private (Technician, Manager, Admin)
export const resolveTicket = async (req, res) => {
  const { resolutionSummary } = req.body;

  if (!resolutionSummary || resolutionSummary.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Please provide a resolution summary describing how the issue was fixed.',
    });
  }

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  ticket.status = 'RESOLVED';
  ticket.resolvedAt = new Date();
  ticket.resolutionSummary = resolutionSummary;
  await ticket.save();

  await recordAuditLog({
    actor: req.user,
    action: 'TICKET_RESOLVED',
    entity: 'Ticket',
    entityId: ticket._id,
    newState: { status: 'RESOLVED', resolutionSummary },
    details: `Ticket ${ticket.ticketNumber} resolved by ${req.user.name}`,
  });

  // Notify requester to confirm or reopen
  await createNotification({
    recipientId: ticket.requester,
    type: 'TICKET_RESOLVED',
    title: `Ticket ${ticket.ticketNumber} Resolved`,
    message: `Your ticket has been marked resolved. Please confirm or reopen if unresolved.`,
    relatedEntity: 'Ticket',
    relatedId: ticket._id,
  });

  const updated = await Ticket.findById(ticket._id)
    .populate('requester', 'name email department avatar')
    .populate('assignee', 'name email avatar')
    .populate('department', 'name code')
    .populate('category', 'name code icon');

  emitEvent('ticket:resolved', updated);
  emitEvent('ticket:updated', updated, `ticket:${ticket._id}`);

  res.status(200).json({
    success: true,
    message: 'Ticket marked as resolved',
    data: updated,
  });
};

// @desc    Reopen ticket (Employee or Manager)
// @route   POST /api/tickets/:id/reopen
// @access  Private
export const reopenTicket = async (req, res) => {
  const { rejectionReason } = req.body;

  if (!rejectionReason || rejectionReason.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Please provide a reason explaining why the issue is still unresolved.',
    });
  }

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  ticket.status = 'REOPENED';
  ticket.reopenedAt = new Date();
  ticket.rejectionReason = rejectionReason;
  await ticket.save();

  await recordAuditLog({
    actor: req.user,
    action: 'TICKET_REOPENED',
    entity: 'Ticket',
    entityId: ticket._id,
    newState: { status: 'REOPENED', rejectionReason },
    details: `Ticket ${ticket.ticketNumber} reopened by ${req.user.name}: ${rejectionReason}`,
  });

  // Notify technician or manager
  if (ticket.assignee) {
    await createNotification({
      recipientId: ticket.assignee,
      type: 'TICKET_REOPENED',
      title: `Reopened: ${ticket.ticketNumber}`,
      message: `Employee reported: "${rejectionReason}"`,
      relatedEntity: 'Ticket',
      relatedId: ticket._id,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Ticket reopened',
    data: ticket,
  });
};

// @desc    Close ticket (Employee or Manager or Admin)
// @route   POST /api/tickets/:id/close
// @access  Private
export const closeTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  ticket.status = 'CLOSED';
  ticket.closedAt = new Date();
  await ticket.save();

  await recordAuditLog({
    actor: req.user,
    action: 'TICKET_CLOSED',
    entity: 'Ticket',
    entityId: ticket._id,
    newState: { status: 'CLOSED' },
    details: `Ticket ${ticket.ticketNumber} closed by ${req.user.name}`,
  });

  // Notify technician if employee closed it
  if (ticket.assignee && ticket.requester.toString() === req.user._id.toString()) {
    await createNotification({
      recipientId: ticket.assignee,
      type: 'TICKET_CLOSED',
      title: `Closed: ${ticket.ticketNumber}`,
      message: `Requester confirmed resolution and closed the ticket.`,
      relatedEntity: 'Ticket',
      relatedId: ticket._id,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Ticket confirmed and closed',
    data: ticket,
  });
};

// @desc    Add attachment to existing ticket
// @route   POST /api/tickets/:id/attachments
// @access  Private
export const addAttachment = async (req, res) => {
  const { name, url, size, mimeType } = req.body;

  if (!name || !url) {
    return res.status(400).json({
      success: false,
      message: 'Attachment name and URL/data are required.',
    });
  }

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const newAttachment = {
    name,
    url,
    size: size || 0,
    mimeType: mimeType || 'application/octet-stream',
    uploader: req.user._id,
    uploadedAt: new Date(),
  };

  ticket.attachments.push(newAttachment);
  await ticket.save();

  await recordAuditLog({
    actor: req.user,
    action: 'TICKET_UPDATED',
    entity: 'Ticket',
    entityId: ticket._id,
    newState: { attachmentsCount: ticket.attachments.length },
    details: `Attachment "${name}" added by ${req.user.name}`,
  });

  const updated = await Ticket.findById(ticket._id)
    .populate('requester', 'name email department avatar')
    .populate('assignee', 'name email avatar')
    .populate('department', 'name code')
    .populate('category', 'name code icon')
    .populate('asset');

  res.status(201).json({
    success: true,
    message: 'Attachment added successfully',
    data: updated,
  });
};
