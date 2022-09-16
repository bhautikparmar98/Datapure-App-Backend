import mongoose, { Model, Schema } from 'mongoose';
import { IImageComment } from './types';

// image comment schema for mongoose ORM
const ImageCommentSchema = new Schema<IImageComment>(
  {
    userId: {
      type: Number,
      required: true,
    },
    imageId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// create the model with that schema and export it
export const ImageComment: Model<IImageComment> = mongoose.model(
  'ImageComment',
  ImageCommentSchema
);
