import { RequestHandler } from 'express';
import logger from '../../loaders/logger';

import { appResponse } from '../../utils';
import { Project } from './model';
import ImageService from '../image/service';
import ac from '../../utils/accesscontrol';
import UserService from '../user/service';

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
      imagesCount: 0,
      annotationCount: 0,
      clientReviewCount: 0,
      doneCount: 0,
      qaCount: 0,
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

const assignAdminsToProjects: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    const isAdmin = UserService.isAdmin(+adminId);

    if (!isAdmin)
      return res.status(400).send(appResponse('Invalid admin id', false));

    const project = await Project.findById(id as string);

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    if (project.adminId)
      await UserService.decrementNumberOfWorkingProjects(project.adminId);

    await UserService.incrementNumberOfWorkingProjects(+adminId);
    project.adminId = +adminId;

    project.save();

    res.status(200).send({ success: true });
  } catch (error) {
    logger.error(error);
    res.status(500).send(appResponse('Error getting project images', false));
  }
};

export { createProject, getProjectImages, addImages, assignAdminsToProjects };
