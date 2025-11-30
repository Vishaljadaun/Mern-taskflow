// Dashboard.jsx
// Enhanced Task Dashboard with:
// - Search & Filter
// - Priority & Due Date
// - Create / Edit modal (same form used for create + edit)
// - Delete confirmation modal
// - Toast feedbacks
// - Uses axios instance (api) that already attaches JWT
// - All UI uses Tailwind v4 classes
//
// IMPORTANT: This is a single-file replacement for your Dashboard page.
// Copy & paste verbatim into src/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

// Helper: format date nicely for display
const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
};

// Default empty task object used for both create & edit
const EMPTY_TASK = {
  title: "",
  description: "",
  completed: false,
  priority: "Medium", // Low, Medium, High
  dueDate: "", // ISO string or empty
};

export default function Dashboard() {
  // tasks fetched from backend
  const [tasks, setTasks] = useState([]);

  // UI & control states
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(""); // search box
  const [filter, setFilter] = useState("all"); // all / completed / pending
  const [showModal, setShowModal] = useState(false); // show create/edit modal
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [currentTask, setCurrentTask] = useState(EMPTY_TASK); // editing/creating task
  const [editTaskId, setEditTaskId] = useState(null); // when editing, ID of task
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/tasks");
      setTasks(res.data || []);
    } catch (err) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter + search logic (derived array shown on UI)
  const filteredTasks = tasks
    .filter((t) => {
      if (filter === "completed") return t.completed;
      if (filter === "pending") return !t.completed;
      return true;
    })
    .filter((t) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        (t.title || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.priority || "").toLowerCase().includes(q)
      );
    })
    // sort: High priority first, then dueDate nearest first, then createdAt desc
    .sort((a, b) => {
      const pRank = { High: 3, Medium: 2, Low: 1 };
      const pa = pRank[a.priority] || 2;
      const pb = pRank[b.priority] || 2;
      if (pa !== pb) return pb - pa; // high first

      // both have priority same — check due date
      if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      // fallback newest first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // Open create modal
  const openCreateModal = () => {
    setModalMode("create");
    setCurrentTask(EMPTY_TASK);
    setEditTaskId(null);
    setShowModal(true);
  };

  // Open edit modal, set currentTask to existing values
  const openEditModal = (task) => {
    setModalMode("edit");
    // Map backend fields to our form (keep shape)
    setCurrentTask({
      title: task.title || "",
      description: task.description || "",
      completed: !!task.completed,
      priority: task.priority || "Medium",
      dueDate: task.dueDate ? task.dueDate.substring(0, 16) : "", // local input friendly (YYYY-MM-DDTHH:mm)
    });
    setEditTaskId(task._id);
    setShowModal(true);
  };

  // Close modal helper
  const closeModal = () => {
    setShowModal(false);
    setCurrentTask(EMPTY_TASK);
    setEditTaskId(null);
  };

  // Handle create or update from modal
  const submitModal = async (e) => {
    e.preventDefault();
    // basic validation
    if (!currentTask.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setActionLoading(true);

    try {
      // Prepare payload: convert dueDate to ISO if present
      const payload = {
        title: currentTask.title,
        description: currentTask.description,
        completed: !!currentTask.completed,
        priority: currentTask.priority,
        dueDate: currentTask.dueDate ? new Date(currentTask.dueDate).toISOString() : undefined,
      };

      if (modalMode === "create") {
        const res = await api.post("/api/tasks", payload);
        // append new task to UI
        setTasks(([...prev]) => [res.data.task, ...prev]);
        toast.success("Task created");
      } else {
        // update
        const res = await api.put(`/api/tasks/${editTaskId}`, payload);
        setTasks((prev) => prev.map((t) => (t._id === editTaskId ? res.data : t)));
        toast.success("Task updated");
      }

      closeModal();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle complete/incomplete quickly without opening modal
  const toggleComplete = async (task) => {
    try {
      const res = await api.put(`/api/tasks/${task._id}`, { completed: !task.completed });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
      toast.success(task.completed ? "Marked pending" : "Marked completed");
    } catch {
      toast.error("Could not update task");
    }
  };

  // Prepare delete confirmation modal
  const confirmDelete = (task) => {
    setTaskToDelete(task);
    setShowDeleteConfirm(true);
  };

  // Execute delete after confirmation
  const handleDelete = async () => {
    if (!taskToDelete) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/tasks/${taskToDelete._id}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));
      toast.success("Task deleted");
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    } catch {
      toast.error("Delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header controls */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">My Tasks</h1>
            <p className="text-sm text-gray-500">Manage your tasks — search, filter, edit & organize.</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, description, priority..."
              className="border p-2 rounded w-full md:w-72"
            />

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            {/* Create task button */}
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + New Task
            </button>
          </div>
        </div>
      </div>

      {/* Tasks container */}
      <div className="max-w-5xl mx-auto">
        {loading ? (
          <p>Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white p-6 rounded shadow text-center">
            <p className="text-gray-600">No tasks found — create your first task.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className="bg-white p-4 rounded shadow flex flex-col sm:flex-row justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`text-lg font-semibold ${task.completed ? "line-through text-gray-500" : ""}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>

                    {/* Priority badge */}
                    <div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {task.priority || "Medium"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    <div>Created: {new Date(task.createdAt).toLocaleString()}</div>
                    {task.dueDate && <div>Due: {formatDate(task.dueDate)}</div>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => toggleComplete(task)}
                    className={`px-3 py-1 rounded text-sm ${
                      task.completed ? "bg-yellow-500 text-white" : "bg-green-500 text-white"
                    }`}
                  >
                    {task.completed ? "Undo" : "Complete"}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(task)}
                      className="px-3 py-1 bg-indigo-500 text-white rounded text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => confirmDelete(task)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -------------------------
          Modal: Create / Edit Task
         ------------------------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{modalMode === "create" ? "Create Task" : "Edit Task"}</h2>

            <form onSubmit={submitModal} className="space-y-3">
              <input
                name="title"
                value={currentTask.title}
                onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                placeholder="Title"
                className="w-full border p-2 rounded"
                required
              />

              <textarea
                name="description"
                value={currentTask.description}
                onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                placeholder="Description (optional)"
                className="w-full border p-2 rounded"
                rows={3}
              />

              <div className="flex gap-2 items-center">
                <label className="text-sm">Priority</label>
                <select
                  value={currentTask.priority}
                  onChange={(e) => setCurrentTask({ ...currentTask, priority: e.target.value })}
                  className="border p-2 rounded"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>

                <label className="ml-4 text-sm">Due Date</label>
                <input
                  type="datetime-local"
                  value={currentTask.dueDate}
                  onChange={(e) => setCurrentTask({ ...currentTask, dueDate: e.target.value })}
                  className="border p-2 rounded"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded border">
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded text-white ${
                    actionLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {actionLoading ? "Saving..." : modalMode === "create" ? "Create" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------
          Modal: Delete confirmation
         ------------------------- */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Delete task?</h3>
            <p className="text-sm text-gray-600 mb-4">This action cannot be undone.</p>

            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setTaskToDelete(null); }} className="px-4 py-2 rounded border">
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className={`px-4 py-2 rounded text-white ${actionLoading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"}`}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
