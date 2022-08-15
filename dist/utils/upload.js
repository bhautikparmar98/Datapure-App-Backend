"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const multer = require('multer');
const upload = multer({
    limits: {
        fileSize: 4 * 1024 * 1024,
    },
    storage: multer.memoryStorage(),
});
exports.default = upload;
