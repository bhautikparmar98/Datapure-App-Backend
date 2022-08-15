"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComments = exports.addComment = exports.addingAnnotation = exports.clientReviewApprove = exports.qaApproveAnnotation = exports.redoHandler = exports.finishAnnotation = exports.signUrl = void 0;
const constants_1 = require("../../constants");
const logger_1 = __importDefault(require("../../loaders/logger"));
const utils_1 = require("../../utils");
const service_1 = __importDefault(require("../annotation/service"));
const service_2 = __importDefault(require("../comments/service"));
const service_3 = __importDefault(require("../project/service"));
const model_1 = require("./model");
const service_4 = __importDefault(require("./service"));
const signUrl = async (req, res) => {
    try {
        const { files } = req.body;
        const result = files.map((file) => service_4.default.getSignedUrl(file));
        res.status(200).send({ files: result });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error sign images.', false);
        res.status(500).send(response);
    }
};
exports.signUrl = signUrl;
const finishAnnotation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const image = await model_1.Image.findById(id);
        if (!image)
            return res.status(400).send((0, utils_1.appResponse)('Invalid Image id', false));
        if (image.annotatorId !== userId)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed.', false));
        const key = image.status === constants_1.ImageStatus.ANNOTATION_INPROGRESS
            ? 'annotationInProgressCount'
            : 'annotationCount';
        service_3.default.updateCount(image.projectId.toString(), {
            qaCount: 1,
            [key]: -1,
        });
        image.status = constants_1.ImageStatus.PENDING_QA;
        image.dateAnnotated = new Date();
        const qaIds = await service_3.default.getQAsIds(image.projectId.toString());
        if (qaIds)
            service_4.default.assignQA(qaIds, image.projectId.toString(), id);
        await image.save();
        res.status(200).send({ success: true });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error sign images.', false);
        res.status(500).send(response);
    }
};
exports.finishAnnotation = finishAnnotation;
const redoHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const image = await model_1.Image.findById(id);
        if (!image)
            return res.status(400).send((0, utils_1.appResponse)('Invalid Image id', false));
        if (image.qaId !== userId)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed.', false));
        image.status = constants_1.ImageStatus.PENDING_REDO;
        service_3.default.updateCount(image.projectId.toString(), {
            qaCount: -1,
            redoCount: 1,
        });
        await image.save();
        res.status(200).send({ success: true });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error sign images.', false);
        res.status(500).send(response);
    }
};
exports.redoHandler = redoHandler;
const qaApproveAnnotation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const image = await model_1.Image.findById(id);
        if (!image)
            return res.status(400).send((0, utils_1.appResponse)('Invalid Image id', false));
        if (image.qaId !== userId)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed.', false));
        image.status = constants_1.ImageStatus.PENDING_CLIENT_REVIEW;
        service_3.default.updateCount(image.projectId.toString(), {
            qaCount: -1,
            clientReviewCount: 1,
        });
        await image.save();
        res.status(200).send({ success: true });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error sign images.', false);
        res.status(500).send(response);
    }
};
exports.qaApproveAnnotation = qaApproveAnnotation;
const clientReviewApprove = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const image = await model_1.Image.findById(id);
        if (!image)
            return res.status(400).send((0, utils_1.appResponse)('Invalid Image id', false));
        const ownerId = await service_3.default.getOwnerId(image.projectId.toString());
        if (ownerId !== userId) {
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed.', false));
        }
        image.status = constants_1.ImageStatus.DONE;
        service_3.default.updateCount(image.projectId.toString(), {
            doneCount: 1,
            clientReviewCount: -1,
        });
        await image.save();
        res.status(200).send({ success: true });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error sign images.', false);
        res.status(500).send(response);
    }
};
exports.clientReviewApprove = clientReviewApprove;
const addingAnnotation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { annotations } = req.body;
        const image = await model_1.Image.findById(id);
        if (!image)
            return res.status(400).send((0, utils_1.appResponse)('Invalid Image id', false));
        const ownerId = await service_3.default.getOwnerId(image.projectId.toString());
        if (image.annotatorId !== userId &&
            image.qaId !== userId &&
            userId !== ownerId) {
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed.', false));
        }
        service_1.default.removeAllForImage(image._id.toString());
        const addedAnnotationIds = await service_1.default.createAnnotations(annotations.map((a) => ({ ...a, imageId: id })));
        image.annotationIds = [...addedAnnotationIds];
        await image.save();
        res.status(200).send({ success: true });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error adding annotations for image', false);
        res.status(500).send(response);
    }
};
exports.addingAnnotation = addingAnnotation;
const getComments = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;
        const image = await model_1.Image.findById(id);
        if (!image)
            return res.status(400).send((0, utils_1.appResponse)('Invalid Image id', false));
        const ownerId = await service_3.default.getOwnerId(image.projectId.toString());
        if (image.annotatorId !== userId &&
            image.qaId !== userId &&
            userId !== ownerId &&
            role !== constants_1.Roles.ADMIN) {
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed.', false));
        }
        const comments = await service_2.default.getCommentsForImage(id);
        res.status(200).send({ comments });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error adding comment for image', false);
        res.status(500).send(response);
    }
};
exports.getComments = getComments;
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { text, x, y } = req.body;
        const image = await model_1.Image.findById(id);
        if (!image)
            return res.status(400).send((0, utils_1.appResponse)('Invalid Image id', false));
        const ownerId = await service_3.default.getOwnerId(image.projectId.toString());
        if (image.annotatorId !== userId &&
            image.qaId !== userId &&
            userId !== ownerId) {
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed.', false));
        }
        await service_2.default.create({
            imageId: image._id,
            userId,
            text,
            x,
            y,
        });
        res.status(200).send({ success: true });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error adding comment for image', false);
        res.status(500).send(response);
    }
};
exports.addComment = addComment;
