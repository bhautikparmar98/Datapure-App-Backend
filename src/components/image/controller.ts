import { RequestHandler } from 'express';
import { ImageStatus } from '../../constants';
import logger from '../../loaders/logger';

import { appResponse } from '../../utils';
import ProjectService from '../project/service';
import { Image } from './model';
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

const finishAnnotation: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const image = await Image.findById(id);

    if (!image)
      return res.status(400).send(appResponse('Invalid Image id', false));

    if (image.annotatorId !== userId)
      return res.status(403).send(appResponse('You are not allowed.', false));

    image.status = ImageStatus.PENDING_QA;

    const qaIds = await ProjectService.getQAsIds(image.projectId.toString());
    if (qaIds) ImageService.assignQA(qaIds, image.projectId.toString(), id);

    await image.save();

    res.status(200).send({ success: true });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error sign images.', false);
    res.status(500).send(response);
  }
};

const redoHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const image = await Image.findById(id);

    if (!image)
      return res.status(400).send(appResponse('Invalid Image id', false));

    if (image.qaId !== userId)
      return res.status(403).send(appResponse('You are not allowed.', false));

    image.status = ImageStatus.PENDING_REDO;

    await image.save();

    res.status(200).send({ success: true });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error sign images.', false);
    res.status(500).send(response);
  }
};

const qaApproveAnnotation: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const image = await Image.findById(id);

    if (!image)
      return res.status(400).send(appResponse('Invalid Image id', false));

    if (image.qaId !== userId)
      return res.status(403).send(appResponse('You are not allowed.', false));

    image.status = ImageStatus.PENDING_CLIENT_REVIEW;

    await image.save();

    res.status(200).send({ success: true });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error sign images.', false);
    res.status(500).send(response);
  }
};

const clientReviewApprove: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const image = await Image.findById(id);

    if (!image)
      return res.status(400).send(appResponse('Invalid Image id', false));

    // get the owner of the project
    const ownerId = await ProjectService.getOwnerId(image.projectId.toString());

    // make sure that is the owner who is the one to confirming
    if (ownerId !== userId) {
      return res.status(403).send(appResponse('You are not allowed.', false));
    }

    image.status = ImageStatus.DONE;

    await image.save();

    res.status(200).send({ success: true });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error sign images.', false);
    res.status(500).send(response);
  }
};

// ---------- PRIVATE --------

export {
  signUrl,
  finishAnnotation,
  redoHandler,
  qaApproveAnnotation,
  clientReviewApprove,
};
