import { Schema, model, Document, models, Types } from "mongoose";

export interface IUserCredit extends Document {
  userId: string;
  guildId: string;
  eCredit: number;
  achievements: string[];
  lastUpdated: Date;
}

// Schema UserCredit
const userCreditSchema = new Schema<IUserCredit>({
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  eCredit: {
    type: Number,
    required: true, // Sửa "require" thành "required"
  },
  achievements: [
    {
      type: String,
    },
  ],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Export model, kiểm tra nếu đã tồn tại thì dùng lại
const UserCredit =
  models.UserCredit || model<IUserCredit>("UserCredit", userCreditSchema);
export default UserCredit;