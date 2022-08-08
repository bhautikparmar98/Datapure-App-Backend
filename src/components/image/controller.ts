import { RequestHandler } from 'express';
import logger from '../../loaders/logger';

import { appResponse } from '../../utils';
import ImageService from './service';

// only client will use this method to create a new register
const signUrl: RequestHandler = async (req, res) => {
  try {
    const { files } = req.body;

    const result = files.map((file: string) => ImageService.getSignedUrl(file));

    res.status(200).send({ files: result });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error sign images.', false);
    res.status(500).send(response);
  }
};

export { signUrl };
