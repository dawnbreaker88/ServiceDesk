import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import { recordAuditLog } from '../utils/audit.js';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
export const getDepartments = async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status) query.status = status;

  const departments = await Department.find(query).populate('head', 'name email').sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: departments.length,
    data: departments,
  });
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
export const getDepartmentById = async (req, res) => {
  const department = await Department.findById(req.params.id).populate('head', 'name email');
  if (!department) {
    return res.status(404).json({ success: false, message: 'Department not found' });
  }
  res.status(200).json({ success: true, data: department });
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (Admin)
export const createDepartment = async (req, res) => {
  const { name, code, description, head, status } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Department name is required' });
  }

  const dept = await Department.create({
    name,
    code: code ? code.toUpperCase() : name.slice(0, 3).toUpperCase(),
    description: description || '',
    head: head || null,
    status: status || 'ACTIVE',
  });

  await recordAuditLog({
    actor: req.user,
    action: 'DEPARTMENT_CREATED',
    entity: 'Department',
    entityId: dept._id,
    newState: { name: dept.name, code: dept.code },
    details: `Department ${dept.name} created`,
  });

  res.status(201).json({
    success: true,
    message: 'Department created successfully',
    data: dept,
  });
};

// @desc    Update department
// @route   PATCH /api/departments/:id
// @access  Private (Admin)
export const updateDepartment = async (req, res) => {
  const dept = await Department.findById(req.params.id);
  if (!dept) {
    return res.status(404).json({ success: false, message: 'Department not found' });
  }

  const { name, code, description, head, status } = req.body;
  if (name) dept.name = name;
  if (code) dept.code = code.toUpperCase();
  if (description !== undefined) dept.description = description;
  if (head !== undefined) dept.head = head;
  if (status) dept.status = status;

  await dept.save();

  await recordAuditLog({
    actor: req.user,
    action: 'DEPARTMENT_UPDATED',
    entity: 'Department',
    entityId: dept._id,
    details: `Department ${dept.name} updated`,
  });

  res.status(200).json({
    success: true,
    message: 'Department updated successfully',
    data: dept,
  });
};

// @desc    Delete / deactivate department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
export const deleteDepartment = async (req, res) => {
  const dept = await Department.findById(req.params.id);
  if (!dept) {
    return res.status(404).json({ success: false, message: 'Department not found' });
  }

  dept.status = 'INACTIVE';
  await dept.save();

  res.status(200).json({
    success: true,
    message: 'Department deactivated successfully',
  });
};
