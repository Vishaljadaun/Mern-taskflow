const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",    // reference user model
      required: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
    },
    description: {
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    
    category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Category",
  default: null,
},
    
    // ✅ NEW FIELD: Priority
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    // ✅ NEW FIELD: Due Date
    dueDate: {
      type: Date,
      default: null,
    },


  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
