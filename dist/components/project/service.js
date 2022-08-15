"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("./model");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const getRemovedIds = (prevIds, newIds) => {
    return prevIds.filter((prevId) => !newIds.includes(prevId));
};
const getAddedIds = (prevIds, newIds) => {
    return newIds.filter((newId) => !prevIds.includes(newId));
};
const getQAsIds = async (projectId) => {
    const project = await model_1.Project.findById(projectId);
    return project === null || project === void 0 ? void 0 : project.assignedQAs;
};
const getOwnerId = async (projectId) => {
    const project = await model_1.Project.findById(projectId);
    return project === null || project === void 0 ? void 0 : project.userId;
};
const updateCount = async (projectId, counts) => {
    const data = { ...counts };
    Object.keys(data).forEach((k) => {
        if (!data[k])
            delete data[k];
    });
    await model_1.Project.findByIdAndUpdate(projectId, { $inc: { ...data } });
};
const createOutputFile = async (projectName, content) => {
    const now = new Date();
    const date = now.getFullYear() + ' ' + (now.getMonth() + 1) + ' ' + now.getDate();
    const time = now.getHours() + ' ' + now.getMinutes() + ' ' + now.getSeconds();
    const filename = `${projectName} ${date} ${time}.json`;
    let absPath = path_1.default.join(path_1.default.resolve('./'), '/temp_files/', filename);
    let relPath = path_1.default.join('./temp_files', filename);
    await (0, mkdirp_1.default)('./temp_files');
    fs_1.default.writeFileSync(relPath, content);
    return absPath;
};
const deleteOutputFile = (path) => {
    fs_1.default.unlinkSync(path);
};
const ProjectService = {
    getRemovedIds,
    getAddedIds,
    getQAsIds,
    getOwnerId,
    updateCount,
    createOutputFile,
    deleteOutputFile,
};
exports.default = ProjectService;
