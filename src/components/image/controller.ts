import { RequestHandler } from 'express';
import { ImageStatus } from '../../constants';
import logger from '../../loaders/logger';

import { appResponse } from '../../utils';
import AnnotationService from '../annotation/service';
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

    const key =
      image.status === ImageStatus.ANNOTATION_INPROGRESS
        ? 'annotationInProgressCount'
        : 'annotationCount';

    ProjectService.updateCount(image.projectId.toString(), {
      qaCount: 1,
      [key]: -1,
    });

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

    ProjectService.updateCount(image.projectId.toString(), {
      qaCount: -1,
      redoCount: 1,
    });

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

    ProjectService.updateCount(image.projectId.toString(), {
      qaCount: -1,
      clientReviewCount: 1,
    });

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

    ProjectService.updateCount(image.projectId.toString(), {
      doneCount: 1,
      clientReviewCount: -1,
    });

    await image.save();

    res.status(200).send({ success: true });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error sign images.', false);
    res.status(500).send(response);
  }
};

const addingAnnotation: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { annotations } = req.body;

    const image = await Image.findById(id);

    if (!image)
      return res.status(400).send(appResponse('Invalid Image id', false));

    // get the owner of the project
    const ownerId = await ProjectService.getOwnerId(image.projectId.toString());

    console.log('image.annotatorId !== userId', image.annotatorId !== userId);

    // make sure that is the user have access to this image
    if (
      image.annotatorId !== userId &&
      image.qaId !== userId &&
      userId !== ownerId
    ) {
      return res.status(403).send(appResponse('You are not allowed.', false));
    }

    // remove all previous annotations
    AnnotationService.removeAllForImage(image._id.toString());

    // create new annotations
    const addedAnnotationIds = await AnnotationService.createAnnotations(
      annotations.map((a: any) => ({ ...a, imageId: id }))
    );

    // update images with the ids
    image.annotationIds = [...addedAnnotationIds];

    await image.save();

    res.status(200).send({ success: true });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error adding annotations for image', false);
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
  addingAnnotation,
};
