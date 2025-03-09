import { Schema, model, models, Document } from "mongoose";

interface IUserAuthorization extends Document {
  userId: string;
  guildId: string;
  password: string;
  isLogin: boolean;
  accessToken?: string; 
  expiresAt?: Date; 
}

const UserAuthorizationSchema = new Schema<IUserAuthorization>({
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isLogin: {
    type: Boolean,
    required: true,
  },
  accessToken: {
    type: String,
  },
  expiresAt: {
    type: Date,
  },
});

const UserAuthorization = models.UserAuthorization || model<IUserAuthorization>("UserAuthorization", UserAuthorizationSchema);
export default UserAuthorization;
