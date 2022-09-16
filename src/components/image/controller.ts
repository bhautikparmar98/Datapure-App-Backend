import { RequestHandler } from 'express';
import { ImageStatus, Roles } from '../../constants';
import logger from '../../loaders/logger';

import { appResponse } from '../../utils';
import AnnotationService from '../annotation/service';
import ImageCommentService from '../comments/service';
import ProjectService from '../project/service';
import { Image } from './model';
import ImageService from './service';

// use it to get a sign url to upload it to s3
const signUrl: RequestHandler = async (req, res) => {
  try {
    // get files from body
    const { files } = req.body;

    // loop through files and for every file get signedURL
    const result = files.map((file: string) => ImageService.getSignedUrl(file));

    // return signed URLS
    res.status(200).send({ files: result });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error sign images.', false);
    res.status(500).send(response);
  }
};

// this method is used to finish annotating of the image
const finishAnnotation: RequestHandler = async (req, res) => {
  try {
    // the id of image
    const { id } = req.params;
    const userId = req.user.id;

    // get image with id
    const image = await Image.findById(id);

    // if image not found return bad request
    if (!image)
      return res.status(400).send(appResponse('Invalid Image id', false));

    // make sure that the one who call this api is the annotator that is assigned to the image
    if (image.annotatorId !== userId)
      return res.status(403).send(appResponse('You are not allowed.', false));

    // validate the image status
    if (
      image.status !== ImageStatus.ANNOTATION_INPROGRESS &&
      image.status !== ImageStatus.PENDING_ANNOTATION &&
      image.status !== ImageStatus.PENDING_REDO
    )
      return res
        .status(400)
        .send(appResponse('This Image is invalid state', false));

    // key that will decrease count set it as annotationCount as default.
    let key = 'annotationCount';

    // if image is in status annotation in progress then we should decrease the annotationInProgressCount
    if (image.status === ImageStatus.ANNOTATION_INPROGRESS)
      key = 'annotationInProgressCount';
    // if image is in redo status we should decrease redoCount
    else if (image.status === ImageStatus.PENDING_REDO) key = 'redoCount';

    // update project with the new counts, decrease the key and increase the QA status
    ProjectService.updateCount(image.projectId.toString(), {
      qaCount: 1,
      [key]: -1,
    });

    // put image in pending QA
    image.status = ImageStatus.PENDING_QA;
    // set the date that the image is finished annotated.
    image.dateAnnotated = new Date();

    // get QAs that is assigned to this project
    const qaIds = await ProjectService.getQAsIds(image.projectId.toString());

    // assign qa to this image to start checking it;
    if (qaIds) ImageService.assignQA(qaIds, image.projectId.toString(), id);

    // save the image
    await image.save();

    res.status(200).send({ success: true });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error sign images.', false);
    res.status(500).send(response);
  }
};

// this function is responsible for making the image in REDO state
const redoHandler: RequestHandler = async (req, res) => {
  try {
    // image id
    const { id } = req.params;
    const userId = req.user.id;

    // find image with this id
    const image = await Image.findById(id);

    if (!image)
      return res.status(400).send(appResponse('Invalid Image id', false));

    // make sure that the calling one is the qa that is assigned to the image.
    if (image.qaId !== userId)
      return res.status(403).send(appResponse('You are not allowed.', false));

    // make sure the requested image in PENDING_QA
    if (image.status !== ImageStatus.PENDING_QA)
      return res
        .status(400)
        .send(appResponse('This Image is invalid state', false));

    image.status = ImageStatus.PENDING_REDO;

    // update counts
    ProjectService.updateCount(image.projectId.toString(), {
      qaCount: -1,
      redoCount: 1,
    });

    // save the image
    await image.save();

    res.status(200).send({ success: true });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error sign images.', false);
    res.status(500).send(response);
  }
};

// this function is responsible for approving the image and update the status from qa to ready for client review
const qaApproveAnnotation: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const image = await Image.findById(id);

    if (!image)
      return res.status(400).send(appResponse('Invalid Image id', false));

    // make sure that the calling one is the qa that is assigned to the image
    if (image.qaId !== userId)
      return res.status(403).send(appResponse('You are not allowed.', false));

    // validate the status of the image
    if (image.status !== ImageStatus.PENDING_QA)
      return res
        .status(400)
        .send(appResponse('This Image is invalid state', false));

    // update the status of the image with PENDING CLIENT REVIEW
    image.status = ImageStatus.PENDING_CLIENT_REVIEW;

    // update the counts
    ProjectService.updateCount(image.projectId.toString(), {
      qaCount: -1,
      clientReviewCount: 1,
    });

    // save the image
    await image.save();

    res.status(200).send({ success: true });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error sign images.', false);
    res.status(500).send(response);
  }
};

// this function is responsible for updating the status of the image from waiting client review to done
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

    // validate the status of the image
    if (image.status !== ImageStatus.PENDING_CLIENT_REVIEW)
      return res
        .status(400)
        .send(appResponse('This Image is invalid state', false));

    // update the status
    image.status = ImageStatus.DONE;

    // update the count
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

// this is function that is responsible to disapprove client
const clientReviewDisApprove: RequestHandler = async (req, res) => {
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

    // validate the status
    if (image.status !== ImageStatus.PENDING_CLIENT_REVIEW)
      return res
        .status(400)
        .send(appResponse('This Image is invalid state', false));

    // update the image status
    image.status = ImageStatus.PENDING_REDO;

    // update the project count
    ProjectService.updateCount(image.projectId.toString(), {
      clientReviewCount: -1,
      redoCount: 1,
    });

    // save the image
    await image.save();

    res.status(200).send({ success: true });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error sign images.', false);
    res.status(500).send(response);
  }
};

// this function is responsible for adding annotations for image
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

    // make sure that is the user have access to this image
    if (
      image.annotatorId !== userId &&
      image.qaId !== userId &&
      userId !== ownerId
    ) {
      return res.status(403).send(appResponse('You are not allowed.', false));
    }

    /**
     * this way is must change in the future now currently we are removing all annotations and adding them all
     * in the future we should add the ability to add and delete and update without not sending all the
     * annotations
     */

    // remove all previous annotations
    AnnotationService.removeAnnotationsWithIds(image.annotationIds);

    // create new annotations
    const addedAnnotationIds = await AnnotationService.createAnnotations(
      annotations.map((a: any) => ({ ...a, imageId: id }))
    );

    // update images with the ids
    await Image.findByIdAndUpdate(id, {
      $set: { annotationIds: addedAnnotationIds },
    });

    res.status(200).send({ success: true });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error adding annotations for image', false);
    res.status(500).send(response);
  }
};

// get comments for image
const getComments: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const image = await Image.findById(id);

    if (!image)
      return res.status(400).send(appResponse('Invalid Image id', false));

    // get the owner of the project
    const ownerId = await ProjectService.getOwnerId(image.projectId.toString());

    // make sure that is the user have access to this image
    if (
      image.annotatorId !== userId &&
      image.qaId !== userId &&
      userId !== ownerId &&
      role !== Roles.ADMIN
    ) {
      return res.status(403).send(appResponse('You are not allowed.', false));
    }

    // get the comments for the image
    const comments = await ImageCommentService.getCommentsForImage(id);

    res.status(200).send({ comments });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error adding comment for image', false);
    res.status(500).send(response);
  }
};

const addComment: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { text, x, y } = req.body;

    const image = await Image.findById(id);

    if (!image)
      return res.status(400).send(appResponse('Invalid Image id', false));

    // get the owner of the project
    const ownerId = await ProjectService.getOwnerId(image.projectId.toString());

    // make sure that is the user have access to this image
    if (
      image.annotatorId !== userId &&
      image.qaId !== userId &&
      userId !== ownerId
    ) {
      return res.status(403).send(appResponse('You are not allowed.', false));
    }

    await ImageCommentService.create({
      imageId: image._id,
      userId,
      text,
      x,
      y,
    });

    res.status(200).send({ success: true });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error adding comment for image', false);
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
  addComment,
  getComments,
  clientReviewDisApprove,
};
