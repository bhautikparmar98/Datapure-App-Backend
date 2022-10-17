import { app } from "./app";
import config from "./config";
import express from "express";
import Logger from "./loaders/logger";

// ?who added the below?
//expand the body limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// make app listen to the port that in the config
app.listen(config.application.port, () => {
  Logger.info(`
      ################################################
      🛡️  Server listening on port: ${config.application.port} 🛡️
      🛡️  Application environment: ${config.application.env}   !🛡️ 
      ################################################`);
});
