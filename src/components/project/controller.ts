import { RequestHandler } from 'express';
import logger from '../../loaders/logger';

import { ImageStatus, Resources, Roles } from '../../constants';
import { appResponse } from '../../utils';
import ac from '../../utils/accesscontrol';
import { IAnnotation } from '../annotation/types';
import ImageService from '../image/service';
import UserService from '../user/service';
import { Project } from './model';
import ProjectService from './service';

// only client will use this method to create a new register
const createProject: RequestHandler = async (req, res) => {
  try {
    const permission = ac.can(req.user.role).createOwn('project');
    if (!permission.granted)
      return res.status(403).send(appResponse('You are not allowed', false));

    const { name, dueAt, type, classes, images } = req.body;

    const project = new Project({
      name,
      dueAt,
      type,
      classes,
      imagesIds: [],
      userId: req.user.id,
      finished: false,
      imagesCount: 0,
      annotationCount: 0,
      annotationInProgressCount: 0,
      clientReviewCount: 0,
      doneCount: 0,
      qaCount: 0,
      redoCount: 0,

      assignedAnnotators: [],
      assignedQAs: [],
    });

    // save to get the project id
    await project.save();

    // save images with project id
    const imagesIds = await ImageService.createImages(
      images,
      project._id.toString() as any
    );

    // updating images ids and count
    project.imagesIds = imagesIds as any;
    project.imagesCount = imagesIds.length;
    project.annotationCount = imagesIds.length;

    // save again after updating the counts
    await project.save();

    res.status(201).send({ project: project.toJSON() });
  } catch (err) {
    logger.error(err);

    const response = appResponse('Error creating a project.', false);
    res.status(500).send(response);
  }
};

const getProject: RequestHandler = async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  try {
    const project = await Project.findById(id as string);

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    if (user.role === Roles.CLIENT && user.id !== project.userId)
      return res.status(403).send(appResponse('You are not allowed', false));
    if (user.role === Roles.ADMIN && user.id !== project.adminId)
      return res.status(403).send(appResponse('You are not allowed', false));

    return res.status(200).send({ project: project.toJSON() });
  } catch (err) {
    logger.error(err);

    const response = appResponse('Error get one project.', false);
    res.status(500).send(response);
  }
};

const addClasses: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { classes } = req.body;

    const project = await Project.findById(id as string);

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    if (user.role === Roles.CLIENT && user.id !== project.userId)
      return res.status(403).send(appResponse('You are not allowed', false));
    if (user.role === Roles.ADMIN && user.id !== project.adminId)
      return res.status(403).send(appResponse('You are not allowed', false));

    await ProjectService.addClasses(id, classes);

    res.status(201).send({ success: true });
  } catch (err) {
    logger.error(err);

    const response = appResponse('Error adding classes to project.', false);
    res.status(500).send(response);
  }
};

const removeImages: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { imageIds } = req.body;

    const project = await Project.findById(id as string);

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    if (user.role === Roles.CLIENT && user.id !== project.userId)
      return res.status(403).send(appResponse('You are not allowed', false));
    if (user.role === Roles.ADMIN && user.id !== project.adminId)
      return res.status(403).send(appResponse('You are not allowed', false));

    await ImageService.removeImages(id, imageIds);

    res.status(200).send({ success: true });
  } catch (err) {
    logger.error(err);

    const response = appResponse('Error removing images from project.', false);
    res.status(500).send(response);
  }
};

const createPreAnnotatedProject: RequestHandler = async (req, res) => {
  try {
    const permission = ac.can(req.user.role).createOwn('project');
    if (!permission.granted)
      return res.status(403).send(appResponse('You are not allowed', false));

    const { name, dueAt, type, classes, images, annotationType } = req.body;

    if (
      annotationType !== ImageStatus.PENDING_ANNOTATION &&
      annotationType !== ImageStatus.PENDING_CLIENT_REVIEW
    ) {
      return res
        .status(400)
        .send(appResponse('Invalid annotation type', false));
    }

    const project = new Project({
      name,
      dueAt,
      type,
      classes,
      imagesIds: [],
      userId: req.user.id,
      finished: false,
      imagesCount: 0,
      annotationCount: 0,
      annotationInProgressCount: 0,
      clientReviewCount: 0,
      doneCount: 0,
      qaCount: 0,
      redoCount: 0,

      assignedAnnotators: [],
      assignedQAs: [],
    });

    const enhancedClasses: any[] = [];
    classes.forEach((element: any, index: number) => {
      enhancedClasses.push({ ...element, _id: project.classes[index]._id });
    });

    // save to get the project id
    await project.save();

    // save images with project id
    const imagesIds = await ImageService.createImagesWithAnnotations(
      images,
      project._id.toString() as any,
      enhancedClasses,
      annotationType
    );

    // updating images ids and count
    project.imagesIds = imagesIds as any;
    project.imagesCount = imagesIds.length;

    if (annotationType === ImageStatus.PENDING_ANNOTATION)
      project.annotationCount = imagesIds.length;
    else if (annotationType === ImageStatus.PENDING_CLIENT_REVIEW)
      project.clientReviewCount = imagesIds.length;

    // save again after updating the counts
    await project.save();

    res.status(201).send({ project: project.toJSON() });
  } catch (err) {
    logger.error(err);

    const response = appResponse('Error creating a project.', false);
    res.status(500).send(response);
  }
};

const addImages: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body;

    const permission = ac.can(req.user.role).createOwn('image');
    if (!permission.granted)
      return res.status(403).send(appResponse('You are not allowed', false));

    const project = await Project.findById(id as string);

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    const imagesIds = await ImageService.createImages(
      images as { url: string; fileName: string }[],
      project._id.toString() as any
    );

    project.imagesIds = [...project.imagesIds, ...imagesIds] as any;
    project.imagesCount = project.imagesCount + imagesIds.length;
    project.annotationCount = project.annotationCount + imagesIds.length;

    await project.save();

    // update the annotators with the new images
    // we don't wait for it's completion
    ImageService.equallyDistributeImagesBetweenAnnotators(
      project._id.toString(),
      project.assignedAnnotators
    );

    return res.status(200).send({ imagesIds });
  } catch (error) {
    logger.error(error);
    res
      .status(500)
      .send(appResponse('Error adding new images for project', false));
  }
};

const getProjectImages: RequestHandler = async (req, res) => {
  try {
    const permission = ac.can(req.user.role).readOwn('image');
    if (!permission.granted)
      return res.status(403).send(appResponse('You are not allowed', false));

    const { id } = req.params;

    const project = await Project.findById(id as string);

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    const images = await ImageService.getProjectImages(id);

    res.status(200).send({ images });
  } catch (error) {
    logger.error(error);
    res.status(500).send(appResponse('Error getting project images', false));
  }
};

const assignAdminToProject: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    const isAdmin = await UserService.isAdmin(+adminId);

    if (!isAdmin)
      return res.status(400).send(appResponse('Invalid admin id', false));

    const project = await Project.findById(id as string);

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    if (project.adminId)
      await UserService.decrementNumberOfWorkingProjects(project.adminId);

    await UserService.incrementNumberOfWorkingProjects(+adminId);
    project.adminId = +adminId;

    await project.save();

    res.status(200).send({ success: true });
  } catch (error) {
    logger.error(error);
    res.status(500).send(appResponse('Error assign admin to project', false));
  }
};

const assignQAsToProject: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { qaIds } = req.body;

    const permission = ac.can(user.role).readOwn(Resources.PROJECT);
    if (!permission.granted)
      return res.status(403).send(appResponse('You are not allowed', false));

    const project = await Project.findById(id as string);

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    if (project.adminId !== user.id)
      return res.status(403).send(appResponse('You are not allowed', false));

    // update number of working project for members
    await updateWorkingProjectNumberForMembers(project.assignedQAs, qaIds);

    project.assignedQAs = qaIds;
    await project.save();

    res.status(200).send({ success: true });
  } catch (error) {
    logger.error(error);
    res.status(500).send(appResponse('Error assign qas to project', false));
  }
};

const assignAnnotatorsToProject: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { annotatorIds } = req.body;

    const permission = ac.can(user.role).readOwn(Resources.PROJECT);
    if (!permission.granted)
      return res.status(403).send(appResponse('You are not allowed', false));

    const project = await Project.findById(id as string);

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    if (project.adminId !== user.id)
      return res.status(403).send(appResponse('You are not allowed', false));

    // update number of working project for members
    await updateWorkingProjectNumberForMembers(
      project.assignedAnnotators,
      annotatorIds
    );

    project.assignedAnnotators = annotatorIds;
    await project.save();

    // distribute images between annotators
    // we don't wait here for the completion
    ImageService.equallyDistributeImagesBetweenAnnotators(
      project._id.toString(),
      annotatorIds
    );

    res.status(200).send({ success: true });
  } catch (error) {
    logger.error(error);
    res.status(500).send(appResponse('Error assign qas to project', false));
  }
};

const getAnnotatorImagesForProject: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { take, redo } = req.query;
    const userId = req.user.id;

    const isAnnotator = UserService.isAnnotator(userId);

    if (!isAnnotator)
      return res.status(403).send(appResponse('You are not allowed.', false));

    let images = [];

    if (redo === 'true')
      images = await ImageService.getProjectRedoImageForAnnotator(
        id,
        userId,
        parseInt(take?.toString() || '100')
      );
    else
      images = await ImageService.getProjectImageForAnnotator(
        id,
        userId,
        parseInt(take?.toString() || '100')
      );

    const imagesPayload = images.map((img) => ({
      _id: img._id.toString(),
      fileName: img.fileName,
      src: img.src,
      project: img.projectId,
      annotations: img.annotationIds,
    }));

    res.status(200).send({ images: imagesPayload });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error getting annotator images', false);
    res.status(500).send(response);
  }
};

const getClientImagesForProject: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { take } = req.query;
    const userId = req.user.id;

    const project = await Project.findById(id as string);

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    if (project.userId !== userId)
      return res.status(403).send(appResponse('You are not allowed', false));

    const images = await ImageService.getProjectPendingReviewImageForClient(
      id,
      parseInt(take?.toString() || '100')
    );

    const imagesPayload = images.map((img) => ({
      _id: img._id.toString(),
      fileName: img.fileName,
      src: img.src,
      project: img.projectId,
      annotations: img.annotationIds,
    }));

    res.status(200).send({ images: imagesPayload });
  } catch (err) {
    logger.error(err);
    const response = appResponse(
      'Error getting pending review client images',
      false
    );
    res.status(500).send(response);
  }
};
const getQAImagesForProject: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { take } = req.query;
    const userId = req.user.id;

    const isQA = UserService.isQA(userId);

    if (!isQA)
      return res.status(403).send(appResponse('You are not allowed.', false));

    const images = await ImageService.getProjectImageForQA(
      id,
      userId,
      parseInt(take?.toString() || '100')
    );

    const imagesPayload = images.map((img) => ({
      _id: img._id.toString(),
      fileName: img.fileName,
      src: img.src,
      project: img.projectId,
      annotations: img.annotationIds,
    }));

    res.status(200).send({ images: imagesPayload });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error getting qa images', false);
    res.status(500).send(response);
  }
};

const downloadOutputFile: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const project = await Project.findById(id as string);

    console.log('I came here1 ');

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    // if he is an admin then he should assigned to this project
    if (user.role === Roles.ADMIN && user.id !== project.adminId)
      return res.status(403).send(appResponse('You are not allowed.', false));

    // if the role is client then he should own the project
    if (user.role === Roles.CLIENT && user.id !== project.userId)
      return res.status(403).send(appResponse('You are not allowed.', false));

    const images = await ImageService.getProjectImagesWithAnnotations(id, [
      ImageStatus.DONE,
      ImageStatus.PENDING_CLIENT_REVIEW,
    ]);

    const classMap: any = {};
    project.classes.forEach((cl) => {
      classMap[cl._id.toString()] = cl;
    });

    const imagesPayload = images.map((img) => {
      return {
        url: img.src,
        fileName: img.fileName,
        annotations: (img.annotationIds as any).map((anno: IAnnotation) => {
          const cl = classMap[anno.classId.toString()];
          return {
            className: cl.name,
            classColor: cl.color,
            shapes: anno.shapes.map((s) => ({
              x: s.x,
              t: s.y,
              width: s.width,
              height: s.height,
              points: s.points,
              type: s.type,
              id: s._id?.toString(),
            })),
          };
        }),
      };
    });

    const json = JSON.stringify(imagesPayload, undefined, 2);

    const path = await ProjectService.createOutputFile(project.name, json);

    res.status(200).download(path, (error) => {
      if (error) {
        logger.error(error);
        throw new Error('can not send the file');
      }
      ProjectService.deleteOutputFile(path);
    });
  } catch (error) {
    logger.error(error);
    const response = appResponse('Error download output file', false);
    res.status(500).send(response);
  }
};

export {
  createProject,
  getProjectImages,
  addImages,
  assignAdminToProject,
  assignQAsToProject,
  assignAnnotatorsToProject,
  getAnnotatorImagesForProject,
  getQAImagesForProject,
  downloadOutputFile,
  getClientImagesForProject,
  createPreAnnotatedProject,
  getProject,
  addClasses,
  removeImages,
};

// --*-------------- PRIVATE

const updateWorkingProjectNumberForMembers = async (
  prevWorkingIds: number[],
  newWorkingIds: number[]
): Promise<void> => {
  const removedMembersIds = ProjectService.getRemovedIds(
    prevWorkingIds,
    newWorkingIds
  );

  // decrement the number of working projects for removed members
  if (removedMembersIds.length) {
    const promises = [];
    for (const memberId of removedMembersIds) {
      promises.push(UserService.decrementNumberOfWorkingProjects(memberId));
    }

    await Promise.all(promises);
  }

  const addMembersIds = ProjectService.getAddedIds(
    prevWorkingIds,
    newWorkingIds
  );

  // increment the number of working projects for new members
  if (addMembersIds.length) {
    const promises = [];
    for (const memberId of addMembersIds) {
      promises.push(UserService.incrementNumberOfWorkingProjects(memberId));
    }

    await Promise.all(promises);
  }
};
