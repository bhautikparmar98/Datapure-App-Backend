"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = require("body-parser");
const celebrate_1 = require("celebrate");
const cors_1 = __importDefault(require("cors"));
const api_1 = require("../api");
const config_1 = __importDefault(require("../config"));
exports.default = ({ app }) => {
    app.use((0, cors_1.default)({
        credentials: true,
        origin: config_1.default.clientURL,
    }));
    app.use((0, body_parser_1.json)());
    app.use(config_1.default.api.prefix, (0, api_1.ApiRoutes)());
    app.use((0, celebrate_1.errors)());
};
