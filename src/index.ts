import { app } from './app';
import config from './config';
import Logger from './loaders/logger';

app.listen(config.application.port, () => {
  Logger.info(`
      ################################################
      🛡️  Server listening on port: ${config.application.port} 🛡️
      🛡️  Application environment: ${config.application.env}   !🛡️ 
      ################################################`);
});
