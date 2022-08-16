"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("./model");
const create = async (comment) => {
    await model_1.ImageComment.create(comment);
};
const getCommentsForImage = async (imageId) => {
    return await model_1.ImageComment.find({ imageId });
};
const deleteImageComment = async (id) => {
    await model_1.ImageComment.findByIdAndDelete(id);
};
const ImageCommentService = {
    create,
    getCommentsForImage,
    deleteImageComment,
};
exports.default = ImageCommentService;
