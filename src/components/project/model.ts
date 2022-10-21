import mongoose, { Model, Schema } from 'mongoose'
import { IProject } from './types'

const ProjectClassSchema = new Schema({
  name: { type: 'string', required: true, trim: true, min: 3 },
  color: { type: 'string', required: true },
  id: { type: 'number' },
})

const MetaDataSchema = new Schema({
  metaname: { type: 'string', required: false },
  metatype: { type: 'string', required: false },
  displayName: { type: 'string', required: false },
  classes: { type: 'string', required: false },
  maxCharacters: { type: 'number', required: false },
  defaultValue: { type: 'string', required: false },
  descriptions: { type: 'string', required: false },
  required: { type: 'boolean', required: false },
})

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
    annotationInProgressCount: {
      type: Number,
      required: true,
    },
    qaCount: {
      type: Number,
      required: true,
    },
    redoCount: {
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

    finished: {
      type: Boolean,
      required: true,
      default: false,
    },

    classes: [ProjectClassSchema],
    imagesIds: [{ type: Schema.Types.ObjectId, ref: 'Image' }],
    adminId: {
      type: Number,
    },

    assignedAnnotators: [{ type: Number }],
    assignedQAs: [{ type: Number }],

    attributes: [MetaDataSchema],

    sdkToken: String,
  },
  { timestamps: true }
)

export const Project: Model<IProject> = mongoose.model('Project', ProjectSchema)
