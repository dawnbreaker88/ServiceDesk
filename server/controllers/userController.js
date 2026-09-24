import { User } from '../models/User.js';
import { Asset } from '../models/Asset.js';
import { recordAuditLog } from '../utils/audit.js';

// @desc    Get all users with pagination, filter, search
// @route   GET /api/users
// @access  Private (IT Staff or Asset Manager)
export const getUsers = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    role,
    department,
    status,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const query = {};

  if (role) query.role = role;
  if (department) query.department = department;
  if (status) query.status = status;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .populate('department', 'name code')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    count: users.length,
    data: users,
  });
};

// @desc    Get user by ID with assigned assets
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).populate('department', 'name code');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Fetch assets assigned to this user
  const assignedAssets = await Asset.find({ assignedUser: user._id, status: 'ASSIGNED' });

  res.status(200).json({
    success: true,
    data: {
      ...user.toObject(),
      assignedAssets,
    },
  });
};

// @desc    Create a user (Admin only)
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = async (req, res) => {
  const { name, email, password, role, department, phone, status } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required.',
    });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'A user with this email address already exists.',
    });
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'EMPLOYEE',
    department: department || null,
    phone: phone || '',
    status: status || 'ACTIVE',
  });

  await recordAuditLog({
    actor: req.user,
    action: 'USER_CREATED',
    entity: 'User',
    entityId: user._id,
    newState: { name: user.name, email: user.email, role: user.role },
    details: `Admin ${req.user.name} created user ${user.email}`,
  });

  user.password = undefined;

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });
};

// @desc    Update a user
// @route   PATCH /api/users/:id
// @access  Private (Admin only, or Manager for non-admin updates)
export const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const previousState = {
    name: user.name,
    role: user.role,
    department: user.department,
    status: user.status,
  };

  const { name, role, department, status, phone, password } = req.body;

  if (name) user.name = name;
  if (role) user.role = role;
  if (department !== undefined) user.department = department;
  if (status) user.status = status;
  if (phone !== undefined) user.phone = phone;
  if (password) user.password = password; // pre-save hook will hash it

  await user.save();
  user.password = undefined;

  await recordAuditLog({
    actor: req.user,
    action: 'USER_UPDATED',
    entity: 'User',
    entityId: user._id,
    previousState,
    newState: { name: user.name, role: user.role, status: user.status },
    details: `Updated user ${user.email}`,
  });

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
};

// @desc    Deactivate or Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Soft delete by default: deactivate
  user.status = 'INACTIVE';
  await user.save();

  await recordAuditLog({
    actor: req.user,
    action: 'USER_DEACTIVATED',
    entity: 'User',
    entityId: user._id,
    details: `User ${user.email} was deactivated by admin ${req.user.name}`,
  });

  res.status(200).json({
    success: true,
    message: 'User account deactivated successfully.',
  });
};
