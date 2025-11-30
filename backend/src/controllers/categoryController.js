const Category = require("../models/Category");
const Task = require("../models/Task");

// Create category
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create({
      user: req.user.id,
      name: req.body.name,
    });

    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get categories for the logged-in user
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id }).sort({ name: 1 });
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!category) return res.status(404).json({ message: "Category not found" });

    category.name = req.body.name;
    await category.save();

    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete category (with safety)
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // If category has tasks, block deletion
    const taskCount = await Task.countDocuments({ category: categoryId });

    if (taskCount > 0) {
      return res.status(400).json({
        message: "Cannot delete category with existing tasks.",
      });
    }

    await Category.deleteOne({ _id: categoryId, user: req.user.id });

    return res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
