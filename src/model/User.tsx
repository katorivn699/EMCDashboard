import mongoose, { Schema, model, Model, Document } from "mongoose";

interface IUser extends Document {
  userId: string; 
  username: string; 
  role: "admin" | "manager" | "member"; 
  createdAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "member"],
      default: "member",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

const User: Model<IUser> =
  mongoose.models.User || model<IUser>("User", userSchema);

export default User;