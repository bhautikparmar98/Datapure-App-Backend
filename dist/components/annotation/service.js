"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("./model");
const createAnnotations = async (annotations) => {
    const results = await model_1.Annotation.insertMany(annotations);
    return results.map((r) => r._id);
};
const removeAllForImage = async (imageId) => {
    await model_1.Annotation.deleteMany({ imageId });
};
const AnnotationService = {
    createAnnotations,
    removeAllForImage,
};
exports.default = AnnotationService;
