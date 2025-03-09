import { Schema, model, Document, models } from "mongoose";

// Định nghĩa interface cho Task document
interface ITask extends Document {
  name: string;
  description: string;
  status: "not_started" | "in_progress" | "review" | "completed";
  deadline: Date;
  assignedTime: Date;
  assigner: Schema.Types.ObjectId;
  projectId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  support?: Schema.Types.ObjectId;
  createdAt: Date;
}

// Định nghĩa schema với kiểu
const taskSchema = new Schema<ITask>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "review", "completed"] as const,
      default: "not_started",
    },
    deadline: {
      type: Date,
      required: true,
    },
    assignedTime: {
      type: Date,
      required: true,
    },
    assigner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    support: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Export model với kiểu
const Task = models.Task || model<ITask>("Task", taskSchema);

export default Task;
