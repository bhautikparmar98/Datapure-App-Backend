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
Object.defineProperty(exports, "__esModule", { value: true });
exports.grantList = void 0;
const constants_1 = require("../constants");
const roles = __importStar(require("../constants/roles"));
exports.grantList = [
    {
        role: roles.SUPER_ADMIN,
        resource: constants_1.Resources.PROJECT,
        action: 'read:any',
        attributes: '*',
    },
    {
        role: roles.SUPER_ADMIN,
        resource: constants_1.Resources.PROJECT,
        action: 'update:any',
        attributes: '*',
    },
    {
        role: roles.SUPER_ADMIN,
        resource: constants_1.Resources.PROJECT,
        action: 'delete:any',
        attributes: '*',
    },
    {
        role: roles.SUPER_ADMIN,
        resource: constants_1.Resources.PROJECT,
        action: 'create:any',
        attributes: '*',
    },
    {
        role: roles.ADMIN,
        resource: constants_1.Resources.PROJECT,
        action: constants_1.Actions.READ_OWN,
        attributes: '*',
    },
    {
        role: roles.ADMIN,
        resource: constants_1.Resources.PROJECT,
        action: constants_1.Actions.UPDATE_OWN,
        attributes: '*',
    },
    {
        role: roles.QA,
        resource: constants_1.Resources.PROJECT,
        action: constants_1.Actions.READ_OWN,
        attributes: '*',
    },
    {
        role: roles.ANNOTATOR,
        resource: constants_1.Resources.PROJECT,
        action: constants_1.Actions.READ_OWN,
        attributes: '*',
    },
    {
        role: roles.CLIENT,
        resource: constants_1.Resources.PROJECT,
        action: constants_1.Actions.READ_OWN,
        attributes: '*',
    },
    {
        role: roles.CLIENT,
        resource: constants_1.Resources.PROJECT,
        action: 'update:own',
        attributes: '*',
    },
    {
        role: roles.CLIENT,
        resource: constants_1.Resources.PROJECT,
        action: 'delete:own',
        attributes: '*',
    },
    {
        role: roles.CLIENT,
        resource: constants_1.Resources.PROJECT,
        action: 'create:own',
        attributes: '*',
    },
    {
        role: roles.SUPER_ADMIN,
        resource: 'user',
        action: 'read:any',
        attributes: '*',
    },
    {
        role: roles.SUPER_ADMIN,
        resource: 'user',
        action: 'create:any',
        attributes: '*',
    },
    {
        role: roles.SUPER_ADMIN,
        resource: 'image',
        action: 'read:any',
        attributes: '*',
    },
    {
        role: roles.ADMIN,
        resource: 'image',
        action: 'read:any',
        attributes: '*',
    },
    {
        role: roles.SUPER_ADMIN,
        resource: 'image',
        action: 'create:any',
        attributes: '*',
    },
    {
        role: roles.CLIENT,
        resource: 'image',
        action: constants_1.Actions.READ_OWN,
        attributes: '*',
    },
    {
        role: roles.CLIENT,
        resource: 'image',
        action: 'create:own',
        attributes: '*',
    },
    {
        role: roles.CLIENT,
        resource: 'image',
        action: 'delete:own',
        attributes: '*',
    },
    {
        role: roles.CLIENT,
        resource: 'image',
        action: 'update:own',
        attributes: '*',
    },
    {
        role: roles.SUPER_ADMIN,
        resource: 'admin',
        action: 'read:any',
        attributes: '*',
    },
    {
        role: roles.SUPER_ADMIN,
        resource: constants_1.Resources.QA,
        action: constants_1.Actions.READ_ANY,
        attributes: '*',
    },
    {
        role: roles.SUPER_ADMIN,
        resource: constants_1.Resources.ANNOTATOR,
        action: constants_1.Actions.READ_ANY,
        attributes: '*',
    },
    {
        role: roles.ADMIN,
        resource: constants_1.Resources.QA,
        action: constants_1.Actions.READ_ANY,
        attributes: '*',
    },
    {
        role: roles.ADMIN,
        resource: constants_1.Resources.ANNOTATOR,
        action: constants_1.Actions.READ_ANY,
        attributes: '*',
    },
    {
        role: roles.ANNOTATOR,
        resource: constants_1.Resources.ANNOTATION,
        action: constants_1.Actions.CREATE_OWN,
        attributes: '*',
    },
    {
        role: roles.QA,
        resource: constants_1.Resources.ANNOTATION,
        action: constants_1.Actions.READ_OWN,
        attributes: '*',
    },
    {
        role: roles.CLIENT,
        resource: constants_1.Resources.ANNOTATION,
        action: constants_1.Actions.CREATE_OWN,
        attributes: '*',
    },
    {
        role: roles.CLIENT,
        resource: constants_1.Resources.OUTPUT_FILE,
        action: constants_1.Actions.READ_ANY,
        attributes: '*',
    },
    {
        role: roles.SUPER_ADMIN,
        resource: constants_1.Resources.OUTPUT_FILE,
        action: constants_1.Actions.READ_ANY,
        attributes: '*',
    },
    {
        role: roles.ADMIN,
        resource: constants_1.Resources.OUTPUT_FILE,
        action: constants_1.Actions.READ_ANY,
        attributes: '*',
    },
];
