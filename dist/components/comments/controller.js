"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImageComment = void 0;
const logger_1 = __importDefault(require("../../loaders/logger"));
const utils_1 = require("../../utils");
const model_1 = require("./model");
const deleteImageComment = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const comment = await model_1.ImageComment.findById(id);
        if (!comment)
            return res.status(400).send((0, utils_1.appResponse)('Invalid comment id', false));
        if (comment.userId !== user.id)
            return res
                .status(400)
                .send((0, utils_1.appResponse)('Only the creating of the comment can delete comment', false));
        await comment.delete();
        res.status(200).send({ success: true });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error deleting comment', false);
        res.status(500).send(response);
    }
};
exports.deleteImageComment = deleteImageComment;
