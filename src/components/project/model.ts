import mongoose, { Model, Schema, ObjectId } from 'mongoose';
import { IProject } from './types';

const ProjectClassSchema = new Schema({
  name: { type: 'string', required: true, trim: true, min: 3 },
  color: { type: 'string', required: true },
});

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      min: 5,
    },
    dueAt: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Number,
      required: true,
    },

    imagesCount: {
      type: Number,
      required: true,
    },
    annotationCount: {
      type: Number,
      required: true,
    },
    qaCount: {
      type: Number,
      required: true,
    },
    clientReviewCount: {
      type: Number,
      required: true,
    },
    doneCount: {
      type: Number,
      required: true,
    },

    classes: [ProjectClassSchema],
    imagesIds: [{ type: Schema.Types.ObjectId, ref: 'Image' }],
    adminId: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const Project: Model<IProject> = mongoose.model(
  'Project',
  ProjectSchema
);
