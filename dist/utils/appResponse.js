"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appResponse = void 0;
const logger_1 = __importDefault(require("../loaders/logger"));
const appResponse = (message, success, data) => {
    success ? logger_1.default.info(message) : logger_1.default.error(data || message);
    return {
        message,
        success,
        payload: data || {},
    };
};
exports.appResponse = appResponse;
