"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadOutputFile = exports.getQAImagesForProject = exports.getAnnotatorImagesForProject = exports.assignAnnotatorsToProject = exports.assignQAsToProject = exports.assignAdminToProject = exports.addImages = exports.getProjectImages = exports.createProject = void 0;
const logger_1 = __importDefault(require("../../loaders/logger"));
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
const accesscontrol_1 = __importDefault(require("../../utils/accesscontrol"));
const service_1 = __importDefault(require("../image/service"));
const service_2 = __importDefault(require("../user/service"));
const model_1 = require("./model");
const service_3 = __importDefault(require("./service"));
const createProject = async (req, res) => {
    try {
        const permission = accesscontrol_1.default.can(req.user.role).createOwn('project');
        if (!permission.granted)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed', false));
        const { name, dueAt, type, classes, images } = req.body;
        const project = new model_1.Project({
            name,
            dueAt,
            type,
            classes,
            imagesIds: [],
            userId: req.user.id,
            finished: false,
            imagesCount: 0,
            annotationCount: 0,
            annotationInProgressCount: 0,
            clientReviewCount: 0,
            doneCount: 0,
            qaCount: 0,
            redoCount: 0,
            assignedAnnotators: [],
            assignedQAs: [],
        });
        await project.save();
        const imagesIds = await service_1.default.createImages(images, project._id.toString());
        project.imagesIds = imagesIds;
        project.imagesCount = imagesIds.length;
        project.annotationCount = imagesIds.length;
        await project.save();
        res.status(201).send({ project: project.toJSON() });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error creating a project.', false);
        res.status(500).send(response);
    }
};
exports.createProject = createProject;
const addImages = async (req, res) => {
    try {
        const { id } = req.params;
        const { images } = req.body;
        const permission = accesscontrol_1.default.can(req.user.role).createOwn('image');
        if (!permission.granted)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed', false));
        const project = await model_1.Project.findById(id);
        if (!project)
            return res.status(400).send((0, utils_1.appResponse)('Invalid project id', false));
        const imagesIds = await service_1.default.createImages(images, project._id.toString());
        project.imagesIds = [...project.imagesIds, ...imagesIds];
        project.imagesCount = project.imagesCount + imagesIds.length;
        project.annotationCount = project.annotationCount + imagesIds.length;
        await project.save();
        service_1.default.equallyDistributeImagesBetweenAnnotators(project._id.toString(), project.assignedAnnotators);
        return res.status(200).send({ imagesIds });
    }
    catch (error) {
        logger_1.default.error(error);
        res
            .status(500)
            .send((0, utils_1.appResponse)('Error adding new images for project', false));
    }
};
exports.addImages = addImages;
const getProjectImages = async (req, res) => {
    try {
        const permission = accesscontrol_1.default.can(req.user.role).readOwn('image');
        if (!permission.granted)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed', false));
        const { id } = req.params;
        const project = await model_1.Project.findById(id);
        if (!project)
            return res.status(400).send((0, utils_1.appResponse)('Invalid project id', false));
        const images = await service_1.default.getProjectImages(id);
        res.status(200).send({ images });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).send((0, utils_1.appResponse)('Error getting project images', false));
    }
};
exports.getProjectImages = getProjectImages;
const assignAdminToProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId } = req.body;
        const isAdmin = await service_2.default.isAdmin(+adminId);
        if (!isAdmin)
            return res.status(400).send((0, utils_1.appResponse)('Invalid admin id', false));
        const project = await model_1.Project.findById(id);
        if (!project)
            return res.status(400).send((0, utils_1.appResponse)('Invalid project id', false));
        if (project.adminId)
            await service_2.default.decrementNumberOfWorkingProjects(project.adminId);
        await service_2.default.incrementNumberOfWorkingProjects(+adminId);
        project.adminId = +adminId;
        await project.save();
        res.status(200).send({ success: true });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).send((0, utils_1.appResponse)('Error assign admin to project', false));
    }
};
exports.assignAdminToProject = assignAdminToProject;
const assignQAsToProject = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { qaIds } = req.body;
        const permission = accesscontrol_1.default.can(user.role).readOwn(constants_1.Resources.PROJECT);
        if (!permission.granted)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed', false));
        const project = await model_1.Project.findById(id);
        if (!project)
            return res.status(400).send((0, utils_1.appResponse)('Invalid project id', false));
        if (project.adminId !== user.id)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed', false));
        await updateWorkingProjectNumberForMembers(project.assignedQAs, qaIds);
        project.assignedQAs = qaIds;
        await project.save();
        res.status(200).send({ success: true });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).send((0, utils_1.appResponse)('Error assign qas to project', false));
    }
};
exports.assignQAsToProject = assignQAsToProject;
const assignAnnotatorsToProject = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { annotatorIds } = req.body;
        const permission = accesscontrol_1.default.can(user.role).readOwn(constants_1.Resources.PROJECT);
        if (!permission.granted)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed', false));
        const project = await model_1.Project.findById(id);
        if (!project)
            return res.status(400).send((0, utils_1.appResponse)('Invalid project id', false));
        if (project.adminId !== user.id)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed', false));
        await updateWorkingProjectNumberForMembers(project.assignedAnnotators, annotatorIds);
        project.assignedAnnotators = annotatorIds;
        await project.save();
        service_1.default.equallyDistributeImagesBetweenAnnotators(project._id.toString(), annotatorIds);
        res.status(200).send({ success: true });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).send((0, utils_1.appResponse)('Error assign qas to project', false));
    }
};
exports.assignAnnotatorsToProject = assignAnnotatorsToProject;
const getAnnotatorImagesForProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { take, redo } = req.query;
        const userId = req.user.id;
        const isAnnotator = service_2.default.isAnnotator(userId);
        if (!isAnnotator)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed.', false));
        let images = [];
        console.log('redo', redo, typeof redo);
        if (redo === 'true')
            images = await service_1.default.getProjectRedoImageForAnnotator(id, userId, parseInt((take === null || take === void 0 ? void 0 : take.toString()) || '100'));
        else
            images = await service_1.default.getProjectImageForAnnotator(id, userId, parseInt((take === null || take === void 0 ? void 0 : take.toString()) || '100'));
        const imagesPayload = images.map((img) => ({
            _id: img._id.toString(),
            fileName: img.fileName,
            src: img.src,
            project: img.projectId,
            annotations: img.annotationIds,
        }));
        res.status(200).send({ images: imagesPayload });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error getting annotator images', false);
        res.status(500).send(response);
    }
};
exports.getAnnotatorImagesForProject = getAnnotatorImagesForProject;
const getQAImagesForProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { take } = req.query;
        const userId = req.user.id;
        const isQA = service_2.default.isQA(userId);
        if (!isQA)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed.', false));
        const images = await service_1.default.getProjectImageForQA(id, userId, parseInt((take === null || take === void 0 ? void 0 : take.toString()) || '100'));
        const imagesPayload = images.map((img) => ({
            _id: img._id.toString(),
            fileName: img.fileName,
            src: img.src,
            project: img.projectId,
            annotations: img.annotationIds,
        }));
        res.status(200).send({ images: imagesPayload });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error getting qa images', false);
        res.status(500).send(response);
    }
};
exports.getQAImagesForProject = getQAImagesForProject;
const downloadOutputFile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const project = await model_1.Project.findById(id);
        console.log('I came here1 ');
        if (!project)
            return res.status(400).send((0, utils_1.appResponse)('Invalid project id', false));
        if (user.role === constants_1.Roles.ADMIN && user.id !== project.adminId)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed.', false));
        if (user.role === constants_1.Roles.CLIENT && user.id !== project.userId)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed.', false));
        const images = await service_1.default.getProjectImagesWithAnnotations(id, [
            constants_1.ImageStatus.DONE,
            constants_1.ImageStatus.PENDING_CLIENT_REVIEW,
        ]);
        const classMap = {};
        project.classes.forEach((cl) => {
            classMap[cl._id.toString()] = cl;
        });
        const imagesPayload = images.map((img) => {
            return {
                url: img.src,
                fileName: img.fileName,
                annotations: img.annotationIds.map((anno) => {
                    const cl = classMap[anno.classId.toString()];
                    return {
                        className: cl.name,
                        classColor: cl.color,
                        shapes: anno.shapes.map((s) => {
                            var _a;
                            return ({
                                x: s.x,
                                t: s.y,
                                width: s.width,
                                height: s.height,
                                points: s.points,
                                type: s.type,
                                id: (_a = s._id) === null || _a === void 0 ? void 0 : _a.toString(),
                            });
                        }),
                    };
                }),
            };
        });
        const json = JSON.stringify(imagesPayload, undefined, 2);
        const path = await service_3.default.createOutputFile(project.name, json);
        res.status(200).download(path, (error) => {
            if (error) {
                logger_1.default.error(error);
                throw new Error('can not send the file');
            }
            service_3.default.deleteOutputFile(path);
        });
    }
    catch (error) {
        logger_1.default.error(error);
        const response = (0, utils_1.appResponse)('Error download output file', false);
        res.status(500).send(response);
    }
};
exports.downloadOutputFile = downloadOutputFile;
const updateWorkingProjectNumberForMembers = async (prevWorkingIds, newWorkingIds) => {
    const removedMembersIds = service_3.default.getRemovedIds(prevWorkingIds, newWorkingIds);
    if (removedMembersIds.length) {
        const promises = [];
        for (const memberId of removedMembersIds) {
            promises.push(service_2.default.decrementNumberOfWorkingProjects(memberId));
        }
        await Promise.all(promises);
    }
    const addMembersIds = service_3.default.getAddedIds(prevWorkingIds, newWorkingIds);
    if (addMembersIds.length) {
        const promises = [];
        for (const memberId of addMembersIds) {
            promises.push(service_2.default.incrementNumberOfWorkingProjects(memberId));
        }
        await Promise.all(promises);
    }
};
