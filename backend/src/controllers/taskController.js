const Task = require("../models/Task");

// -----------------------------
// CREATE TASK
// -----------------------------
exports.createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    const task = await Task.create({
      user: req.user.id,
      title,
      description,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -----------------------------
// GET ALL TASKS OF LOGGED-IN USER
// -----------------------------
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -----------------------------
// UPDATE TASK
// -----------------------------
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const updated = await Task.findOneAndUpdate(
      { _id: taskId, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
