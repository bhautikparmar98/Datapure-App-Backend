"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUrl = void 0;
const logger_1 = __importDefault(require("../../loaders/logger"));
const utils_1 = require("../../utils");
const signUrl = async (req, res) => {
    try {
        res.status(200).send({ files: {} });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error sign images.', false);
        res.status(500).send(response);
    }
};
exports.signUrl = signUrl;
