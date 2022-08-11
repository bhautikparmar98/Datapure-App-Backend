import mongoose, { Model, Schema, ObjectId } from 'mongoose';
import { IImage } from './types';

const ImageSchema = new Schema<IImage>(
  {
    src: {
      type: String,
      required: true,
      trim: true,
      min: 5,
    },

    status: {
      type: String,
      required: true,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    annotatorId: {
      type: Number,
    },
    qaId: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export const Image: Model<IImage> = mongoose.model('Image', ImageSchema);
