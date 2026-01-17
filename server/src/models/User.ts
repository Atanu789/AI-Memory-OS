import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  githubId: string;
  username: string;
  displayName: string;
  email?: string;
  avatar?: string;
  profileUrl?: string;
  accessToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    profileUrl: {
      type: String,
    },
    accessToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", UserSchema);
