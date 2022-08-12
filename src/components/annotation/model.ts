import mongoose, { Model, Schema, ObjectId } from 'mongoose';
import { IIAnnotation } from './types';

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

const AnnotationSchema = new Schema<IIAnnotation>(
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

export const Annotation: Model<IIAnnotation> = mongoose.model(
  'Annotation',
  AnnotationSchema
);
