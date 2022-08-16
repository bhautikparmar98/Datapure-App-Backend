"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./loaders/logger"));
app_1.app.listen(config_1.default.application.port, () => {
    logger_1.default.info(`
      ################################################
      🛡️  Server listening on port: ${config_1.default.application.port} 🛡️
      🛡️  Application environment: ${config_1.default.application.env}   !🛡️ 
      ################################################`);
});
