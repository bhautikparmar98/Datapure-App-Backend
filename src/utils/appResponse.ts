import logger from '../loaders/logger';

// general app response utility for response
export const appResponse = (message: string, success: boolean, data?: any) => {
  success ? logger.info(message) : logger.error(data || message);

  return {
    message,
    success,
    payload: data || {},
  };
};
