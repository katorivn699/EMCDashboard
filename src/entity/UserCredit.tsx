import { Schema, model, Document, models } from "mongoose";

// Định nghĩa interface cho UserCredit document
interface IUserCredit extends Document {
  userId: string; // ID của người chơi
  guildId: string; // ID của guild (nếu là game multiplayer)
  eCredit: number; // Thay cho currency
  achievements: string[]; // Danh sách thành tựu
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