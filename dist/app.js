"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const loaders_1 = __importDefault(require("./loaders"));
exports.app = (0, express_1.default)();
(0, loaders_1.default)({ expressApp: exports.app });
