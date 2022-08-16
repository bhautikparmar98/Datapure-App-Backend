"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("./logger"));
exports.default = async () => {
    try {
        const connection = await mongoose_1.default.connect(config_1.default.mongoDatabaseURL);
        return connection.connection.db;
    }
    catch (error) {
        logger_1.default.log('error', 'Unable to connect with mongo');
    }
};
