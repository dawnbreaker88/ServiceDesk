import { Category } from '../models/Category.js';
import { recordAuditLog } from '../utils/audit.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status) query.status = status;

  const categories = await Category.find(query).sort({ name: 1 });
  res.status(200).json({ success: true, count: categories.length, data: categories });
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
export const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }
  res.status(200).json({ success: true, data: category });
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin or Manager)
export const createCategory = async (req, res) => {
  const { name, code, description, icon, status } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  const category = await Category.create({
    name,
    code: code ? code.toUpperCase() : name.slice(0, 3).toUpperCase(),
    description: description || '',
    icon: icon || 'wrench',
    status: status || 'ACTIVE',
  });

  await recordAuditLog({
    actor: req.user,
    action: 'CATEGORY_CREATED',
    entity: 'Category',
    entityId: category._id,
    newState: { name: category.name, code: category.code },
    details: `Category ${category.name} created`,
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
};

// @desc    Update category
// @route   PATCH /api/categories/:id
// @access  Private (Admin or Manager)
export const updateCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  const { name, code, description, icon, status } = req.body;
  if (name) category.name = name;
  if (code) category.code = code.toUpperCase();
  if (description !== undefined) category.description = description;
  if (icon) category.icon = icon;
  if (status) category.status = status;

  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  category.status = 'INACTIVE';
  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category deactivated successfully',
  });
};
