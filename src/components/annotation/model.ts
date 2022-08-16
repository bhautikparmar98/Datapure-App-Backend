import mongoose, { Model, Schema, ObjectId } from 'mongoose';
import { IAnnotation } from './types';

const ShapeSchema = new Schema({
  x: {
    type: Number,
  },
  y: {
    type: Number,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  id: {
    type: String,
    required: true,
  },
  points: [{ type: Number }],

  type: {
    type: String,
    required: true,
  },
});

const AnnotationSchema = new Schema<IAnnotation>(
  {
    classId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    imageId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    shapes: [ShapeSchema],
  },
  {
    timestamps: true,
  }
);

export const Annotation: Model<IAnnotation> = mongoose.model(
  'Annotation',
  AnnotationSchema
);
