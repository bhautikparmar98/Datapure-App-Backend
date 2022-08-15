"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRoutes = void 0;
const express_1 = require("express");
const router_1 = __importDefault(require("../components/user/router"));
const router_2 = __importDefault(require("../components/ocr/router"));
const router_3 = __importDefault(require("../components/image/router"));
const router_4 = __importDefault(require("../components/project/router"));
const router_5 = __importDefault(require("../components/comments/router"));
const ApiRoutes = () => {
    const app = (0, express_1.Router)();
    app.get('/health', async (req, res) => {
        res.json({ status: 'ok' });
    });
    app.use('/ocr', router_2.default);
    app.use('/user', router_1.default);
    app.use('/image', router_3.default);
    app.use('/project', router_4.default);
    app.use('/imageComment', router_5.default);
    app.use('/', (req, res) => {
        res.status(200).json({ live: true });
    });
    return app;
};
exports.ApiRoutes = ApiRoutes;
