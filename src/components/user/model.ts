import mongoose, { Model, Schema, ObjectId } from 'mongoose';
import { IUser } from './types';

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
    min: 5,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// remove password from response
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export const User: Model<IUser> = mongoose.model('User', UserSchema);
