import { Asset } from '../models/Asset.js';
import { AssetAssignment } from '../models/AssetAssignment.js';
import { User } from '../models/User.js';
import { recordAuditLog } from '../utils/audit.js';
import { createNotification } from '../utils/notificationHelper.js';

// @desc    Get assets with filtering & pagination
// @route   GET /api/assets
// @access  Private
export const getAssets = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    status,
    department,
    assignedUser,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const query = {};

  if (category) query.category = category;
  if (status) query.status = status;
  if (department) query.department = department;
  if (assignedUser) query.assignedUser = assignedUser;

  if (search) {
    query.$or = [
      { assetTag: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { serialNumber: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await Asset.countDocuments(query);
  const assets = await Asset.find(query)
    .populate('assignedUser', 'name email department avatar')
    .populate('department', 'name code')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    count: assets.length,
    data: assets,
  });
};

// @desc    Get single asset by ID with assignment history
// @route   GET /api/assets/:id
// @access  Private
export const getAssetById = async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate('assignedUser', 'name email department phone avatar')
    .populate('department', 'name code');

  if (!asset) {
    return res.status(404).json({ success: false, message: 'Asset not found' });
  }

  const history = await AssetAssignment.find({ asset: asset._id })
    .populate('user', 'name email department avatar')
    .populate('assignedBy', 'name email')
    .sort({ assignedAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      ...asset.toObject(),
      history,
    },
  });
};

// @desc    Get current user's assigned assets (e.g. for AI ticket creation device selection)
// @route   GET /api/assets/my-assets
// @access  Private
export const getMyAssets = async (req, res) => {
  const assets = await Asset.find({ assignedUser: req.user._id, status: 'ASSIGNED' })
    .populate('department', 'name code')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: assets.length,
    data: assets,
  });
};

// @desc    Create new asset
// @route   POST /api/assets
// @access  Private (Asset Manager or Admin)
export const createAsset = async (req, res) => {
  const {
    assetTag,
    name,
    category,
    serialNumber,
    department,
    vendor,
    model,
    purchaseDate,
    warrantyExpiry,
    cost,
    notes,
    specs,
    status = 'IN_STOCK',
  } = req.body;

  if (!assetTag || !name || !serialNumber) {
    return res.status(400).json({
      success: false,
      message: 'Asset Tag, name, and serial number are required.',
    });
  }

  const tagExists = await Asset.findOne({ assetTag: assetTag.toUpperCase() });
  if (tagExists) {
    return res.status(400).json({
      success: false,
      message: `Asset tag ${assetTag} is already registered.`,
    });
  }

  const asset = await Asset.create({
    assetTag: assetTag.toUpperCase(),
    name,
    category: category || 'LAPTOP',
    serialNumber,
    department: department || null,
    vendor: vendor || '',
    model: model || '',
    purchaseDate: purchaseDate || null,
    warrantyExpiry: warrantyExpiry || null,
    cost: cost || 0,
    notes: notes || '',
    specs: specs || {},
    status,
  });

  await recordAuditLog({
    actor: req.user,
    action: 'ASSET_CREATED',
    entity: 'Asset',
    entityId: asset._id,
    newState: { assetTag: asset.assetTag, name: asset.name, status: asset.status },
    details: `Asset ${asset.assetTag} created by ${req.user.name}`,
  });

  res.status(201).json({
    success: true,
    message: 'Asset created successfully',
    data: asset,
  });
};

// @desc    Update asset details
// @route   PATCH /api/assets/:id
// @access  Private (Asset Manager or Admin)
export const updateAsset = async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'Asset not found' });
  }

  const {
    name,
    category,
    serialNumber,
    department,
    vendor,
    model,
    purchaseDate,
    warrantyExpiry,
    cost,
    notes,
    specs,
  } = req.body;

  if (name) asset.name = name;
  if (category) asset.category = category;
  if (serialNumber) asset.serialNumber = serialNumber;
  if (department !== undefined) asset.department = department;
  if (vendor !== undefined) asset.vendor = vendor;
  if (model !== undefined) asset.model = model;
  if (purchaseDate !== undefined) asset.purchaseDate = purchaseDate;
  if (warrantyExpiry !== undefined) asset.warrantyExpiry = warrantyExpiry;
  if (cost !== undefined) asset.cost = cost;
  if (notes !== undefined) asset.notes = notes;
  if (specs !== undefined) asset.specs = specs;

  await asset.save();

  res.status(200).json({
    success: true,
    message: 'Asset updated successfully',
    data: asset,
  });
};

// @desc    Assign asset to employee
// @route   POST /api/assets/:id/assign
// @access  Private (Asset Manager or Admin)
export const assignAsset = async (req, res) => {
  const { userId, reason = 'Employee hardware allocation' } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'Target user ID is required.' });
  }

  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'Asset not found' });
  }

  const user = await User.findById(userId);
  if (!user || user.status !== 'ACTIVE') {
    return res.status(400).json({ success: false, message: 'Target user is invalid or deactivated.' });
  }

  // Update asset
  asset.assignedUser = user._id;
  asset.status = 'ASSIGNED';
  if (user.department) asset.department = user.department;
  await asset.save();

  // Create historical assignment record
  const assignment = await AssetAssignment.create({
    asset: asset._id,
    user: user._id,
    assignedBy: req.user._id,
    assignedAt: new Date(),
    reason,
  });

  await recordAuditLog({
    actor: req.user,
    action: 'ASSET_ASSIGNED',
    entity: 'Asset',
    entityId: asset._id,
    newState: { assignedUser: user.name, status: 'ASSIGNED' },
    details: `Asset ${asset.assetTag} assigned to ${user.name} (${user.email})`,
  });

  // Notify employee
  await createNotification({
    recipientId: user._id,
    type: 'ASSET_ASSIGNED',
    title: `Asset Assigned: ${asset.name}`,
    message: `You have been allocated ${asset.name} (${asset.assetTag}).`,
    relatedEntity: 'Asset',
    relatedId: asset._id,
  });

  res.status(200).json({
    success: true,
    message: `Asset assigned to ${user.name}`,
    data: { asset, assignment },
  });
};

// @desc    Return asset from employee to stock
// @route   POST /api/assets/:id/return
// @access  Private (Asset Manager or Admin)
export const returnAsset = async (req, res) => {
  const { notes = 'Asset returned to company stock' } = req.body;

  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'Asset not found' });
  }

  const previousUser = asset.assignedUser;

  // Mark latest active assignment as returned
  await AssetAssignment.findOneAndUpdate(
    { asset: asset._id, returnedAt: null },
    { returnedAt: new Date(), notes }
  );

  asset.assignedUser = null;
  asset.status = 'IN_STOCK';
  await asset.save();

  await recordAuditLog({
    actor: req.user,
    action: 'ASSET_RETURNED',
    entity: 'Asset',
    entityId: asset._id,
    previousState: { assignedUser: previousUser },
    newState: { status: 'IN_STOCK' },
    details: `Asset ${asset.assetTag} returned to inventory stock`,
  });

  res.status(200).json({
    success: true,
    message: `Asset ${asset.assetTag} successfully returned to stock.`,
    data: asset,
  });
};

// @desc    Send asset to repair
// @route   POST /api/assets/:id/repair
// @access  Private (Asset Manager or Admin)
export const repairAsset = async (req, res) => {
  const { repairNotes = '' } = req.body;

  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'Asset not found' });
  }

  asset.status = 'IN_REPAIR';
  if (repairNotes) {
    asset.notes = asset.notes ? `${asset.notes}\n[Repair Note]: ${repairNotes}` : `[Repair Note]: ${repairNotes}`;
  }
  await asset.save();

  await recordAuditLog({
    actor: req.user,
    action: 'ASSET_SENT_TO_REPAIR',
    entity: 'Asset',
    entityId: asset._id,
    newState: { status: 'IN_REPAIR' },
    details: `Asset ${asset.assetTag} marked for hardware repair.`,
  });

  res.status(200).json({
    success: true,
    message: 'Asset status updated to IN_REPAIR',
    data: asset,
  });
};

// @desc    Retire asset
// @route   POST /api/assets/:id/retire
// @access  Private (Asset Manager or Admin)
export const retireAsset = async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'Asset not found' });
  }

  asset.status = 'RETIRED';
  asset.assignedUser = null;
  await asset.save();

  await recordAuditLog({
    actor: req.user,
    action: 'ASSET_RETIRED',
    entity: 'Asset',
    entityId: asset._id,
    newState: { status: 'RETIRED' },
    details: `Asset ${asset.assetTag} retired from active inventory`,
  });

  res.status(200).json({
    success: true,
    message: 'Asset retired successfully',
    data: asset,
  });
};
