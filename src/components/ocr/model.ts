import mongoose, { Model, Schema } from 'mongoose';
import { IOcr } from './types';

const OcrSchema = new Schema<IOcr>({
  description: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Ocr: Model<IOcr> = mongoose.model('Ocr', OcrSchema);
