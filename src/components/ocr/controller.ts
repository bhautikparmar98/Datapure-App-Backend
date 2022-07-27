import path from 'path';
import { RequestHandler } from 'express';
import vision from '@google-cloud/vision';
import { appResponse } from '../../utils';
import { logger } from '../../utils/logger';

const getOCR: RequestHandler = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      const response = appResponse(
        `Image is not populated in the request buffer`,
        false
      );
      return res.status(400).send(response);
    }

    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.textDetection(req.file.buffer);
    const response = appResponse('Fetched OCR for image', true, result);
    return res.send(response);
  } catch (err) {
    logger.error(err);
    const response = appResponse(`Couldn't detect OCR with Google`, false);
    return res.status(500).send(response);
  }
};

export { getOCR };
