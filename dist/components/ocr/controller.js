"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOCR = void 0;
const vision_1 = __importDefault(require("@google-cloud/vision"));
const utils_1 = require("../../utils");
const logger_1 = __importDefault(require("../../loaders/logger"));
const getOCR = async (req, res) => {
    var _a;
    try {
        if (!((_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer)) {
            const response = (0, utils_1.appResponse)(`Image is not populated in the request buffer`, false);
            return res.status(400).send(response);
        }
        const client = new vision_1.default.ImageAnnotatorClient();
        const [result] = await client.textDetection(req.file.buffer);
        const response = (0, utils_1.appResponse)('Fetched OCR for image', true, result);
        return res.send(response);
    }
    catch (err) {
        const response = (0, utils_1.appResponse)(`Couldn't detect OCR with Google`, false);
        logger_1.default.error(err);
        return res.status(500).send(response);
    }
};
exports.getOCR = getOCR;
