"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const celebrate_1 = require("celebrate");
const express_1 = require("express");
const constants_1 = require("../../constants");
const ac_1 = __importDefault(require("../../middlewares/ac"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const controller = __importStar(require("./controller"));
const validate_1 = require("./validate");
const router = (0, express_1.Router)();
router.post('/register', (0, celebrate_1.celebrate)({ body: validate_1.UserRegistrationSchema }), controller.registerClient);
router.post('/login', (0, celebrate_1.celebrate)({ body: validate_1.UserLoginSchema }), controller.login);
router.use(auth_1.default);
router.get('/', controller.getAllUsers);
router.post('/invite', (0, celebrate_1.celebrate)({ body: validate_1.UserInviteSchema }), controller.inviteUser);
router.get('/admin/project', controller.getAdminProjects);
router.get('/qa/project', controller.getQAProjects);
router.get('/annotator/project', controller.getAnnotatorProjects);
router.get('/clients', ac_1.default.check({
    resource: constants_1.Resources.USER,
    action: constants_1.Actions.READ,
}), controller.getClients);
router.get('/admins', ac_1.default.check({
    resource: constants_1.Resources.ADMIN,
    action: constants_1.Actions.READ,
}), controller.getAdmins);
router.get('/qa', ac_1.default.check({
    resource: constants_1.Resources.QA,
    action: constants_1.Actions.READ,
}), controller.getQAs);
router.get('/annotator', ac_1.default.check({
    resource: constants_1.Resources.ANNOTATOR,
    action: constants_1.Actions.READ,
}), controller.getAnnotators);
router.get('/:id/password', controller.getPassword);
router.get('/:id/project', controller.getClientsProjects);
exports.default = router;
