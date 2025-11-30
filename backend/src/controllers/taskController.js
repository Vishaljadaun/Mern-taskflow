const Task = require("../models/Task");

// -----------------------------
// CREATE TASK
// -----------------------------
exports.createTask = async (req, res) => {
  try {
const { title, description, completed, priority, dueDate, category } = req.body;

    const task = await Task.create({
      user: req.user.id,
      title,
      description,
      completed: completed || false,
      priority: priority || "Medium",
      dueDate: dueDate || null,
      category: category || null,
    });

    return res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -----------------------------
// GET ALL TASKS OF LOGGED-IN USER
// -----------------------------
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({
      priority: -1, // High > Medium > Low
      dueDate: 1,   // earliest first
      createdAt: -1,
    });

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -----------------------------
// UPDATE TASK
// -----------------------------
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, user: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // fields allowed to update
    const { title, description, completed, priority, dueDate } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (category !== undefined) task.category = category;


    await task.save();

    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -----------------------------
// DELETE TASK
// -----------------------------
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const deleted = await Task.findOneAndDelete({
      _id: taskId,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
