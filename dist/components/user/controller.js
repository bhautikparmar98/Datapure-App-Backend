"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnnotatorProjects = exports.getQAProjects = exports.getAnnotators = exports.getQAs = exports.getAdminProjects = exports.getAdmins = exports.getClients = exports.getClientsProjects = exports.getPassword = exports.inviteUser = exports.getAllUsers = exports.login = exports.registerClient = void 0;
const dbClient_1 = __importDefault(require("../../dbClient"));
const logger_1 = __importDefault(require("../../loaders/logger"));
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
const service_1 = __importDefault(require("./service"));
const accesscontrol_1 = __importDefault(require("../../utils/accesscontrol"));
const model_1 = require("../project/model");
const service_2 = __importDefault(require("../image/service"));
const registerClient = async (req, res) => {
    try {
        const { password, email, firstName, lastName, company } = req.body;
        const userExist = await dbClient_1.default.user.findFirst({
            where: { email: { equals: email } },
        });
        if (userExist)
            return res.status(400).send((0, utils_1.appResponse)('Email exist before.', false));
        const createdClientInfo = await dbClient_1.default.clientInfo.create({
            data: { company },
        });
        const { content, iv } = await service_1.default.encrypt(password);
        await dbClient_1.default.user.create({
            data: {
                email,
                hashedPassword: content,
                iv,
                firstName,
                lastName,
                role: constants_1.Roles.CLIENT,
                active: true,
                clientInfoId: createdClientInfo.id,
            },
        });
        res.status(201).send({ success: true });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error registering user.', false);
        res.status(500).send(response);
    }
};
exports.registerClient = registerClient;
const login = async (req, res) => {
    try {
        const { password, email } = req.body;
        const user = await dbClient_1.default.user.findFirst({
            where: { email: { equals: email } },
        });
        if (!user)
            return res.status(401).send((0, utils_1.appResponse)('Invalid Credentials.', false));
        const isValidCred = await service_1.default.verifyPassword({
            content: user.hashedPassword,
            iv: user.iv,
        }, password);
        if (!isValidCred)
            return res.status(401).send((0, utils_1.appResponse)('Invalid Credentials.', false));
        const token = service_1.default.generateAuthToken({
            email: user.email,
            fullName: `${user.firstName} ${user.lastName}`,
            id: user.id,
            role: user.role,
        });
        res.status(201).send({ token });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error logging user.', false);
        res.status(500).send(response);
    }
};
exports.login = login;
const getAllUsers = async (req, res) => {
    try {
        let { skip = 0, take = 5 } = req.query;
        const updatedSkip = parseInt(skip.toString());
        const updatedTake = parseInt(take.toString());
        const permission = accesscontrol_1.default.can(req.user.role).readAny('user');
        if (!permission.granted)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed', false));
        const usersCount = await dbClient_1.default.user.count({
            where: {
                role: { not: constants_1.Roles.SUPER_ADMIN },
            },
        });
        const users = await dbClient_1.default.user.findMany({
            skip: updatedSkip,
            take: updatedTake,
            include: {
                clientInfo: true,
            },
            where: {
                role: { not: constants_1.Roles.SUPER_ADMIN },
            },
        });
        const updatedUsers = users.map((u) => mapUserToDTO(u));
        res.send({ users: updatedUsers, totalCount: usersCount });
    }
    catch (error) {
        console.log('error');
        const response = (0, utils_1.appResponse)('Error get all users', false);
        res.status(500).send(response);
    }
};
exports.getAllUsers = getAllUsers;
const inviteUser = async (req, res) => {
    try {
        const { email, firstName, lastName, company, role } = req.body;
        const permission = accesscontrol_1.default.can(req.user.role).createAny('user');
        if (!permission.granted || role === constants_1.Roles.SUPER_ADMIN)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed', false));
        const userExist = await dbClient_1.default.user.findFirst({
            where: { email: { equals: email } },
        });
        if (userExist)
            return res.status(400).send((0, utils_1.appResponse)('Email exist before.', false));
        const password = service_1.default.generateRandomPassword();
        const createdClientInfo = await dbClient_1.default.clientInfo.create({
            data: { company },
        });
        const { content, iv } = await service_1.default.encrypt(password);
        const createdUser = await dbClient_1.default.user.create({
            data: {
                email,
                hashedPassword: content,
                iv,
                firstName,
                lastName,
                role,
                active: true,
                clientInfoId: createdClientInfo.id,
            },
        });
        await service_1.default.sendInvitationMail(createdUser, password);
        res.status(201).send({
            user: mapUserToDTO({ ...createdUser, clientInfo: createdClientInfo }),
        });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error inviting user.', false);
        res.status(500).send(response);
    }
};
exports.inviteUser = inviteUser;
const getPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const permission = accesscontrol_1.default.can(req.user.role).readAny('user');
        if (!permission.granted)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed', false));
        const user = await dbClient_1.default.user.findFirst({
            where: { id: { equals: +id } },
        });
        if (!user)
            return res.status(400).send((0, utils_1.appResponse)('Invalid User.', false));
        if (user.role === constants_1.Roles.SUPER_ADMIN)
            return res.status(403).send((0, utils_1.appResponse)('Not allowed.', false));
        const password = service_1.default.decrypt({
            iv: user.iv,
            content: user.hashedPassword,
        });
        res.send({ password });
    }
    catch (error) {
        console.log('error');
        const response = (0, utils_1.appResponse)('Error getting password', false);
        res.status(500).send(response);
    }
};
exports.getPassword = getPassword;
const getClientsProjects = async (req, res) => {
    try {
        const permission = accesscontrol_1.default.can(req.user.role).readOwn(constants_1.Resources.PROJECT);
        if (!permission.granted)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed', false));
        const { id } = req.params;
        const projects = await model_1.Project.find({ userId: id });
        const payloadProjects = projects.map((p) => p.toJSON());
        res.status(200).send({ projects: payloadProjects });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error getting client projects', false);
        res.status(500).send(response);
    }
};
exports.getClientsProjects = getClientsProjects;
const getAdminProjects = async (req, res) => {
    try {
        const permission = accesscontrol_1.default.can(req.user.role).readOwn(constants_1.Resources.PROJECT);
        if (!permission.granted)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed', false));
        const { id } = req.user;
        const projects = await model_1.Project.find({ adminId: id, finished: false });
        const payloadProjects = projects.map((p) => p.toJSON());
        res.status(200).send({ projects: payloadProjects });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error getting admin projects', false);
        res.status(500).send(response);
    }
};
exports.getAdminProjects = getAdminProjects;
const getQAProjects = async (req, res) => {
    try {
        const permission = accesscontrol_1.default.can(req.user.role).readOwn(constants_1.Resources.PROJECT);
        if (!permission.granted)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed', false));
        const { id } = req.user;
        const countsArr = [];
        const projects = await model_1.Project.find({ assignedQAs: id, finished: false });
        const payloadProjects = projects.map((p) => p.toJSON());
        for (let i = 0; i < payloadProjects.length; i++) {
            const p = payloadProjects[i];
            const counts = await service_2.default.getQAStatics(p._id, id);
            countsArr.push({ ...counts, projectId: p._id });
        }
        res.status(200).send({ projects: payloadProjects, QACounts: countsArr });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error getting admin projects', false);
        res.status(500).send(response);
    }
};
exports.getQAProjects = getQAProjects;
const getAnnotatorProjects = async (req, res) => {
    try {
        const permission = accesscontrol_1.default.can(req.user.role).readOwn(constants_1.Resources.PROJECT);
        if (!permission.granted)
            return res.status(403).send((0, utils_1.appResponse)('You are not allowed', false));
        const { id } = req.user;
        const countsArr = [];
        const projects = await model_1.Project.find({
            assignedAnnotators: id,
            finished: false,
        });
        const payloadProjects = projects.map((p) => p.toJSON());
        for (let i = 0; i < payloadProjects.length; i++) {
            const p = payloadProjects[i];
            const counts = await service_2.default.getAnnotatorStatics(p._id, id);
            countsArr.push({ ...counts, projectId: p._id });
        }
        res
            .status(200)
            .send({ projects: payloadProjects, annotatorCounts: countsArr });
    }
    catch (err) {
        logger_1.default.error(err);
        const response = (0, utils_1.appResponse)('Error getting admin projects', false);
        res.status(500).send(response);
    }
};
exports.getAnnotatorProjects = getAnnotatorProjects;
const getClients = async (req, res) => {
    try {
        const users = await getUsersByRole(constants_1.Roles.CLIENT);
        const updatedUsers = users.map((u) => mapUserToDTO(u));
        res.send({ clients: updatedUsers });
    }
    catch (error) {
        console.log('error');
        const response = (0, utils_1.appResponse)('Error get all clients', false);
        res.status(500).send(response);
    }
};
exports.getClients = getClients;
const getAdmins = async (req, res) => {
    try {
        const admins = await getUsersByRole(constants_1.Roles.ADMIN);
        const updatedUsers = admins.map((u) => mapUserToDTO(u));
        res.send({ admins: updatedUsers });
    }
    catch (error) {
        console.log('error');
        const response = (0, utils_1.appResponse)('Error get all Admins', false);
        res.status(500).send(response);
    }
};
exports.getAdmins = getAdmins;
const getQAs = async (req, res) => {
    try {
        const qas = await getUsersByRole(constants_1.Roles.QA);
        const updatedUsers = qas.map((u) => mapUserToDTO(u));
        res.send({ qas: updatedUsers });
    }
    catch (error) {
        console.log('error');
        const response = (0, utils_1.appResponse)('Error get all Admins', false);
        res.status(500).send(response);
    }
};
exports.getQAs = getQAs;
const getAnnotators = async (req, res) => {
    try {
        const annotators = await getUsersByRole(constants_1.Roles.ANNOTATOR);
        const updatedUsers = annotators.map((u) => mapUserToDTO(u));
        res.send({ annotators: updatedUsers });
    }
    catch (error) {
        console.log('error');
        const response = (0, utils_1.appResponse)('Error get all Admins', false);
        res.status(500).send(response);
    }
};
exports.getAnnotators = getAnnotators;
const getUsersByRole = async (role) => {
    return await dbClient_1.default.user.findMany({
        include: {
            clientInfo: true,
        },
        where: {
            role,
            active: true,
        },
    });
};
const mapUserToDTO = (user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    role: user.role,
    email: user.email,
    numberOfActiveProjects: user.numberOfActiveProjects,
    clientInfo: user.clientInfo,
});
