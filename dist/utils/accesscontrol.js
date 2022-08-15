"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const accesscontrol_1 = require("accesscontrol");
const grantsList_1 = require("../config/grantsList");
const ac = new accesscontrol_1.AccessControl(grantsList_1.grantList);
exports.default = ac;
