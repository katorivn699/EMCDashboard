import mongoose, { Schema, model, Model, Document } from "mongoose";

interface ITask extends Document {
  name: string;
  status: "not_started" | "in_progress" | "review" | "completed";
  deadline: Date;
  assignedTime: Date;
  assigner: string;
  createdAt: Date;
}

const taskSchema: Schema<ITask> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "review", "completed"],
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
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false } 
);

const Task: Model<ITask> =
  mongoose.models.Task || model<ITask>("Task", taskSchema);

export default Task;