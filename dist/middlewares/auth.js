"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dbClient_1 = __importDefault(require("../dbClient"));
const config_1 = __importDefault(require("../config"));
const auth = async (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.header('x-access-token')) === null || _a === void 0 ? void 0 : _a.replace('bearer ', '');
        if (!token)
            throw new Error('');
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
        if (!decoded || typeof decoded === 'string')
            throw new Error('');
        const user = await dbClient_1.default.user.findFirst({ where: { id: decoded.id } });
        if (!user) {
            throw new Error('');
        }
        req.token = token;
        req.user = { ...user, fullName: `${user.firstName} ${user.lastName}` };
        next();
    }
    catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};
exports.default = auth;
