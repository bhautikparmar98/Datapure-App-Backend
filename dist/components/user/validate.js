"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInviteSchema = exports.UserLoginSchema = exports.UserRegistrationSchema = void 0;
const celebrate_1 = require("celebrate");
const constants_1 = require("../../constants");
exports.UserRegistrationSchema = celebrate_1.Joi.object({
    password: celebrate_1.Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    firstName: celebrate_1.Joi.string().min(2).max(30).required(),
    lastName: celebrate_1.Joi.string().min(2).max(30).required(),
    email: celebrate_1.Joi.string().email().required(),
    company: celebrate_1.Joi.string().min(2).max(50).required(),
});
exports.UserLoginSchema = celebrate_1.Joi.object({
    password: celebrate_1.Joi.string().required(),
    email: celebrate_1.Joi.string().email().required(),
});
exports.UserInviteSchema = celebrate_1.Joi.object({
    firstName: celebrate_1.Joi.string().min(2).max(30).required(),
    lastName: celebrate_1.Joi.string().min(2).max(30).required(),
    email: celebrate_1.Joi.string().email().required(),
    company: celebrate_1.Joi.string().min(2).max(50).required(),
    role: celebrate_1.Joi.string()
        .valid(constants_1.Roles.ADMIN, constants_1.Roles.ANNOTATOR, constants_1.Roles.CLIENT, constants_1.Roles.QA)
        .required(),
});
