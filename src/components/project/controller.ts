import { RequestHandler } from 'express';
import logger from '../../loaders/logger';

import { appResponse } from '../../utils';
import { Project } from './model';
import ImageService from '../image/service';
import ac from '../../utils/accesscontrol';
import UserService from '../user/service';
import ProjectService from './service';
import { Resources } from '../../constants';

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

    project.save();

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

export {
  createProject,
  getProjectImages,
  addImages,
  assignAdminToProject,
  assignQAsToProject,
  assignAnnotatorsToProject,
};
