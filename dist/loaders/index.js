"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("./express"));
const logger_1 = __importDefault(require("./logger"));
const mongoose_1 = __importDefault(require("./mongoose"));
exports.default = async ({ expressApp, }) => {
    await (0, mongoose_1.default)();
    logger_1.default.info('✌️ Mongodb loaded and connecteddd');
    await (0, express_1.default)({ app: expressApp });
    logger_1.default.info('✌️ Express loaded');
};
