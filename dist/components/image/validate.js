"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addImageCommentSchema = exports.AddAnnotationSchema = exports.ImageSignSchema = void 0;
const celebrate_1 = require("celebrate");
const constants_1 = require("../../constants");
const ImageSignSchema = celebrate_1.Joi.object({
    files: celebrate_1.Joi.array().items(celebrate_1.Joi.string()).required(),
});
exports.ImageSignSchema = ImageSignSchema;
const AddAnnotationSchema = celebrate_1.Joi.object({
    annotations: celebrate_1.Joi.array()
        .items(celebrate_1.Joi.object({
        classId: celebrate_1.Joi.string().required(),
        visible: celebrate_1.Joi.bool(),
        shapes: celebrate_1.Joi.array().items(celebrate_1.Joi.object({
            x: celebrate_1.Joi.number(),
            y: celebrate_1.Joi.number(),
            width: celebrate_1.Joi.number(),
            height: celebrate_1.Joi.number(),
            id: celebrate_1.Joi.string().required(),
            points: celebrate_1.Joi.array().items(celebrate_1.Joi.number()),
            type: celebrate_1.Joi.string().valid(constants_1.ShapeType.RECTANGLE, constants_1.ShapeType.LINE, constants_1.ShapeType.ERASER),
        })),
    }))
        .required(),
});
exports.AddAnnotationSchema = AddAnnotationSchema;
const addImageCommentSchema = celebrate_1.Joi.object({
    text: celebrate_1.Joi.string().required(),
    x: celebrate_1.Joi.number(),
    y: celebrate_1.Joi.number(),
});
exports.addImageCommentSchema = addImageCommentSchema;
