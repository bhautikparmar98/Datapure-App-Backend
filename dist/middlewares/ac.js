"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const accesscontrol_middleware_1 = __importDefault(require("accesscontrol-middleware"));
const accesscontrol_1 = __importDefault(require("../utils/accesscontrol"));
const accessControlMiddleware = new accesscontrol_middleware_1.default(accesscontrol_1.default);
exports.default = accessControlMiddleware;
