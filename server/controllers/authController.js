import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { generateToken } from '../utils/token.js';
import { recordAuditLog } from '../utils/audit.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.',
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password')
    .populate('department', 'name code');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  if (user.status !== 'ACTIVE') {
    return res.status(403).json({
      success: false,
      message: 'Your account is deactivated. Please contact an administrator.',
    });
  }

  const token = generateToken(user._id);

  // Exclude password from response
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    token,
    user,
  });
};

// @desc    Register a new user (default: EMPLOYEE)
// @route   POST /api/auth/register
// @access  Public (or Admin for any role)
export const register = async (req, res) => {
  const { name, email, password, department, role, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required.',
    });
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'A user with this email address already exists.',
    });
  }

  // Only allow non-admin registrants to register as EMPLOYEE
  let assignedRole = 'EMPLOYEE';
  if (req.user && req.user.role === 'ADMIN' && role) {
    assignedRole = role;
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: assignedRole,
    department: department || null,
    phone: phone || '',
  });

  await recordAuditLog({
    actor: req.user || user,
    action: 'USER_REGISTERED',
    entity: 'User',
    entityId: user._id,
    newState: { name: user.name, email: user.email, role: user.role },
    details: `User account created for ${user.email} with role ${user.role}`,
  });

  const token = generateToken(user._id);
  user.password = undefined;

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user,
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('department', 'name code');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found.',
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
};

// @desc    Update current user profile
// @route   PATCH /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user,
  });
};

// @desc    Change password
// @route   PATCH /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Both current password and new password are required.',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long.',
    });
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.matchPassword(currentPassword))) {
    return res.status(400).json({
      success: false,
      message: 'Incorrect current password.',
    });
  }

  user.password = newPassword;
  await user.save();

  await recordAuditLog({
    actor: req.user,
    action: 'PASSWORD_CHANGED',
    entity: 'User',
    entityId: user._id,
    details: 'User successfully changed account password.',
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully.',
  });
};

// @desc    Logout (stateless acknowledgment)
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};
