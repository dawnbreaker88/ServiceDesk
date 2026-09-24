import { TroubleshootingGuide } from '../models/TroubleshootingGuide.js';
import { recordAuditLog } from '../utils/audit.js';

// @desc    Get all troubleshooting guides
// @route   GET /api/guides
// @access  Private
export const getGuides = async (req, res) => {
  const { category, search, active } = req.query;
  const query = {};

  if (category) query.category = category;
  if (active !== undefined) query.active = active === 'true';
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { symptoms: { $regex: search, $options: 'i' } },
    ];
  }

  const guides = await TroubleshootingGuide.find(query)
    .populate('category', 'name code icon')
    .sort({ title: 1 });

  res.status(200).json({
    success: true,
    count: guides.length,
    data: guides,
  });
};

// @desc    Get single guide by ID
// @route   GET /api/guides/:id
// @access  Private
export const getGuideById = async (req, res) => {
  const guide = await TroubleshootingGuide.findById(req.params.id).populate('category', 'name code icon');
  if (!guide) {
    return res.status(404).json({ success: false, message: 'Guide not found' });
  }
  res.status(200).json({ success: true, data: guide });
};

// @desc    Create new troubleshooting guide
// @route   POST /api/guides
// @access  Private (Manager or Admin)
export const createGuide = async (req, res) => {
  const { title, category, symptoms, diagnosticQuestions, steps, suggestedPriority } = req.body;

  if (!title || !category) {
    return res.status(400).json({ success: false, message: 'Title and category are required.' });
  }

  const guide = await TroubleshootingGuide.create({
    title,
    category,
    symptoms: symptoms || [],
    diagnosticQuestions: diagnosticQuestions || [],
    steps: steps || [],
    suggestedPriority: suggestedPriority || 'MEDIUM',
  });

  await recordAuditLog({
    actor: req.user,
    action: 'GUIDE_CREATED',
    entity: 'Category',
    entityId: guide._id,
    details: `Troubleshooting guide "${guide.title}" created.`,
  });

  res.status(201).json({
    success: true,
    message: 'Troubleshooting guide created successfully',
    data: guide,
  });
};

// @desc    Update troubleshooting guide
// @route   PATCH /api/guides/:id
// @access  Private (Manager or Admin)
export const updateGuide = async (req, res) => {
  const guide = await TroubleshootingGuide.findById(req.params.id);
  if (!guide) {
    return res.status(404).json({ success: false, message: 'Guide not found' });
  }

  const { title, category, symptoms, diagnosticQuestions, steps, active, suggestedPriority } = req.body;

  if (title) guide.title = title;
  if (category) guide.category = category;
  if (symptoms) guide.symptoms = symptoms;
  if (diagnosticQuestions) guide.diagnosticQuestions = diagnosticQuestions;
  if (steps) guide.steps = steps;
  if (active !== undefined) guide.active = active;
  if (suggestedPriority) guide.suggestedPriority = suggestedPriority;

  await guide.save();

  res.status(200).json({
    success: true,
    message: 'Troubleshooting guide updated successfully',
    data: guide,
  });
};

// @desc    Delete troubleshooting guide
// @route   DELETE /api/guides/:id
// @access  Private (Manager or Admin)
export const deleteGuide = async (req, res) => {
  const guide = await TroubleshootingGuide.findById(req.params.id);
  if (!guide) {
    return res.status(404).json({ success: false, message: 'Guide not found' });
  }

  guide.active = false;
  await guide.save();

  res.status(200).json({
    success: true,
    message: 'Guide deactivated successfully',
  });
};
