"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ProjectClassSchema = new mongoose_1.Schema({
    name: { type: 'string', required: true, trim: true, min: 3 },
    color: { type: 'string', required: true },
});
const ProjectSchema = new mongoose_1.Schema({
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
    imagesIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Image' }],
    adminId: {
        type: Number,
    },
    assignedAnnotators: [{ type: Number }],
    assignedQAs: [{ type: Number }],
}, { timestamps: true });
exports.Project = mongoose_1.default.model('Project', ProjectSchema);
