import { RequestHandler } from 'express';
import logger from '../../loaders/logger';
import { appResponse } from '../../utils';

// only client will use this method to create a new register
const signUrl: RequestHandler = async (req, res) => {
  try {
    res.status(200).send({ files: {} });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error sign images.', false);
    res.status(500).send(response);
  }
};

// ---------- PRIVATE --------

export { signUrl };
