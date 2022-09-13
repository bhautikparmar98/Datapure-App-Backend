import mongoose, { Model, Schema } from 'mongoose';
import { IAnnotation } from './types';

// embedded schema for shape that is used in the annotation schema
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

// annotation schema
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

// create the annotation model from schema and export it
export const Annotation: Model<IAnnotation> = mongoose.model(
  'Annotation',
  AnnotationSchema
);
