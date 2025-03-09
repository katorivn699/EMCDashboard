import mongoose, { Schema, model, Document, Model } from "mongoose";

interface IProject extends Document {
  projectName: string;
  description: string;
  createdAt: Date;
}

const projectSchema = new Schema<IProject>({
  projectName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Project: Model<IProject> =
  mongoose.models.Project || model<IProject>("Project", projectSchema);
export default Project;
