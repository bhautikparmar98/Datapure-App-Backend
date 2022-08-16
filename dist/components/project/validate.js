"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignAnnotatorsToProjectSchema = exports.AssignQAToProjectSchema = exports.AssignAdminsToProjectSchema = exports.AddImageToProjectSchema = exports.CreateProject = void 0;
const celebrate_1 = require("celebrate");
const constants_1 = require("../../constants");
exports.CreateProject = celebrate_1.Joi.object({
    name: celebrate_1.Joi.string().min(2).max(50).required(),
    dueAt: celebrate_1.Joi.date().required(),
    type: celebrate_1.Joi.string()
        .valid(constants_1.AnnotationTypes.IMAGE_ANNOTATION, constants_1.AnnotationTypes.TEXT_ANNOTATION)
        .required(),
    images: celebrate_1.Joi.array()
        .items(celebrate_1.Joi.object({
        url: celebrate_1.Joi.string().required(),
        fileName: celebrate_1.Joi.string().required(),
    }))
        .required(),
    classes: celebrate_1.Joi.array()
        .items(celebrate_1.Joi.object({
        name: celebrate_1.Joi.string().min(2).max(50).required(),
        color: celebrate_1.Joi.string().min(2).max(50).required(),
    }))
        .required(),
});
exports.AddImageToProjectSchema = celebrate_1.Joi.object({
    images: celebrate_1.Joi.array()
        .items(celebrate_1.Joi.object({
        url: celebrate_1.Joi.string().required(),
        fileName: celebrate_1.Joi.string().required(),
    }))
        .required(),
});
exports.AssignAdminsToProjectSchema = celebrate_1.Joi.object({
    adminId: celebrate_1.Joi.number(),
});
exports.AssignQAToProjectSchema = celebrate_1.Joi.object({
    qaIds: celebrate_1.Joi.array().items(celebrate_1.Joi.number()),
});
exports.AssignAnnotatorsToProjectSchema = celebrate_1.Joi.object({
    annotatorIds: celebrate_1.Joi.array().items(celebrate_1.Joi.number()),
});
