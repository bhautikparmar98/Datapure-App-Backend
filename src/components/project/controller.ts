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
import { generateAuthToken } from '../../utils/jwt';
import AnnotationService from '../annotation/service';
import { Image } from '../image/model';
import { Annotation } from '../annotation/model';

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

const CreateProjectForHUmanInLoop: RequestHandler = async (req, res) => {
  try {
    const permission = ac.can(req.user.role).createOwn('project');
    if (!permission.granted)
      return res.status(403).send(appResponse('You are not allowed', false));

    const { name, dueAt, classes, dataType } = req.body;

    const project = new Project({
      name,
      dueAt,
      type: dataType, //set type as HUMAN_IN_LOOP
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

    const user = req.user;

    // generate sdk token
    const sdkToken = generateAuthToken({
      payload: {
        email: user.email,
        fullName: user.fullName,
        id: user.id,
        role: user.role,
        projectId: project._id.toString(),
      },
    });
    project.sdkToken = sdkToken;

    // save to get the project id
    await project.save();

    project.imagesCount = 0;
    project.annotationCount = 0;

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

    // to get the project as a client you should own the project
    if (user.role === Roles.CLIENT && user.id !== project.userId)
      return res.status(403).send(appResponse('You are not allowed', false));
    // to get the project as an admin you should assigned to this project through super admin
    if (user.role === Roles.ADMIN && user.id !== project.adminId)
      return res.status(403).send(appResponse('You are not allowed', false));

    // return project
    return res.status(200).send({ project: project.toJSON() });
  } catch (err) {
    logger.error(err);

    const response = appResponse('Error get one project.', false);
    res.status(500).send(response);
  }
};

// used for SDK
const getProjectId: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    const sdkToken = req.header('x-access-token')?.replace('bearer ', '');
    if (!sdkToken) throw new Error('SDK Token is required');
    const project = await Project.findOne({
      sdkToken,
    });

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    if (user.role !== Roles.CLIENT || user.id !== project.userId)
      return res.status(403).send(appResponse('You are not allowed', false));

    let response = appResponse('Found project id', true, {
      projectId: project._id,
    });
    return res.send(response);
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error with getting project id.', false);
    res.status(500).send(response);
  }
};

// add classes to project
const addClasses: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { classes } = req.body;

    const project = await Project.findById(id as string);

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    // to add classes to the project as a client you should own the project
    if (user.role === Roles.CLIENT && user.id !== project.userId)
      return res.status(403).send(appResponse('You are not allowed', false));
    // to add classes to the project as an admin you should assigned to this project through super admin
    if (user.role === Roles.ADMIN && user.id !== project.adminId)
      return res.status(403).send(appResponse('You are not allowed', false));

    // add classes to the project
    await ProjectService.addClasses(id, classes);

    res.status(201).send({ success: true });
  } catch (err) {
    logger.error(err);

    const response = appResponse('Error adding classes to project.', false);
    res.status(500).send(response);
  }
};

// remove images from the project
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

    // call remove images from project
    await ImageService.removeImages(id, imageIds);

    res.status(200).send({ success: true });
  } catch (err) {
    logger.error(err);

    const response = appResponse('Error removing images from project.', false);
    res.status(500).send(response);
  }
};

// create a pre-annotated project
const createPreAnnotatedProject: RequestHandler = async (req, res) => {
  try {
    const permission = ac.can(req.user.role).createOwn('project');
    if (!permission.granted)
      return res.status(403).send(appResponse('You are not allowed', false));

    const { name, dueAt, type, classes, images, annotationType, dataType } =
      req.body;

    // the image status should be one of pending annotation or pending client review
    if (
      annotationType !== ImageStatus.PENDING_ANNOTATION &&
      annotationType !== ImageStatus.PENDING_CLIENT_REVIEW
    ) {
      return res
        .status(400)
        .send(appResponse('Invalid annotation type', false));
    }

    // create the project
    const project = new Project({
      name,
      dueAt,
      type: dataType,
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

    // know which status count will update
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
    const { images, imgsStatus = ImageStatus.PENDING_ANNOTATION } = req.body;

    const permission = ac.can(req.user.role).createOwn('image');
    if (!permission.granted)
      return res.status(403).send(appResponse('You are not allowed', false));

    const project = await Project.findById(id as string);

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    // create images
    const imagesIds = await ImageService.createImages(
      images as { url: string; fileName: string }[],
      project._id.toString() as any,
      imgsStatus
    );

    // update images ids in the project and update counts
    project.imagesIds = [...project.imagesIds, ...imagesIds] as any;
    project.imagesCount = project.imagesCount + imagesIds.length;
    project.annotationCount = project.annotationCount + imagesIds.length;

    // save the project
    await project.save();

    const classes = project.classes;

    const enhancedClasses: any[] = [];
    classes.forEach((element: any, index: number) => {
      enhancedClasses.push({
        ...element,
        _id: project.classes[index]._id,
        id: project.classes[index].id,
      });
    });

    const newImages = await ImageService.getProjectImages(id);

    // const imagesIdOfProject = project.imagesIds.map((id) => id.toString());

    await Promise.all(
      images.map(async (image: any) => {
        const i = newImages.find((data) => data.src === image.url);
        if (i) {
          const annotationsIds = await AnnotationService.createPreAnnotations(
            image.annotations,
            i._id.toString(),
            enhancedClasses
          );
          console.log(annotationsIds);
          return Image.findByIdAndUpdate(i._id, {
            $set: { annotationIds: [...annotationsIds] },
          })
            .then((res) => {
              console.log(res);
            })
            .catch((er) => {
              console.log(er);
            });
        }
      })
    );

    // update the annotators with the new images
    // we don't wait for it's completion
    ImageService.equallyDistributeImagesBetweenAnnotators(
      project._id.toString(),
      project.assignedAnnotators
    );

    // return the added ids
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

    // get project images by project id
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

    // make sure that the id sended in the body is an admin
    const isAdmin = await UserService.isAdmin(+adminId);

    if (!isAdmin)
      return res.status(400).send(appResponse('Invalid admin id', false));

    const project = await Project.findById(id as string);

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    // if the project already have an admin id we should decrement the number of working projects for the prev admin
    if (project.adminId)
      await UserService.decrementNumberOfWorkingProjects(project.adminId);

    // increase the number of working project for this admin
    await UserService.incrementNumberOfWorkingProjects(+adminId);
    // assign the new admin to the project
    project.adminId = +adminId;

    // save...
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

    // make sure that the user is the admin that assigned to this project or this is the client who owns the project
    if (
      (user.role === Roles.ADMIN && project.adminId !== user.id) ||
      (user.role === Roles.CLIENT && project.userId !== user.id)
    )
      return res.status(403).send(appResponse('You are not allowed', false));

    // update number of working project for members
    await updateWorkingProjectNumberForMembers(project.assignedQAs, qaIds);

    // update the assigned QAs
    project.assignedQAs = qaIds;

    // save
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
// make sure that the user is the admin that assigned to this project or this is the client who owns the project
      if (
        (user.role === Roles.ADMIN && project.adminId !== user.id) ||
        (user.role === Roles.CLIENT && project.userId !== user.id)
      )
      return res.status(403).send(appResponse('You are not allowed', false));

    // update number of working project for members
    await updateWorkingProjectNumberForMembers(
      project.assignedAnnotators,
      annotatorIds
    );

    // update assigned annotators
    project.assignedAnnotators = annotatorIds;

    // save the project
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

const addMetaDataToProject: RequestHandler = async (req, res) => {
  try {
    // const user = req.user;
    const { id } = req.params;

    // const permission = ac.can(user.role).readOwn(Resources.PROJECT);
    // if (!permission.granted)
    //   return res.status(403).send(appResponse('You are not allowed', false));

    const project = await Project.findById(id as string);

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    // make sure that the user is the admin that assigned to this project

    // if (project.adminId !== user.id)
    //   return res.status(403).send(appResponse('You are not allowed', false));
    console.log('hello');
    // update assigned annotators
    project.attributes = [...project.attributes, req.body];

    const classesIdArray = project.classes.map((e) => e._id.toString());
    // await Annotation.updateMany(
    //   { classId: { $in: classesIdArray } },
    //   {
    //     $unset: {
    //       metadata: 1
    //     },
    //   }
    // );

    await Annotation.updateMany(
      { classId: { $in: classesIdArray } },
      {
        $set: {
          [`attributes.${req.body.metaname}`]: req.body.defaultValue || '',
        },
      }
    );

    // save the project
    await project.save();

    res.status(200).send({ success: true });
  } catch (error) {
    logger.error(error);
    res
      .status(500)
      .send(appResponse('Error,in adding meta-properties in project', false));
  }
};

const getAnnotatorImagesForProject: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { take, redo } = req.query;
    const userId = req.user.id;

    // checking if the user is annotator
    const isAnnotator = await UserService.isAnnotator(userId);

    if (!isAnnotator)
      return res.status(403).send(appResponse('You are not allowed.', false));

    let images = [];

    // if redo = true we need to get the redo images for that annotator
    if (redo === 'true')
      images = await ImageService.getProjectRedoImageForAnnotator(
        id,
        userId,
        parseInt(take?.toString() || '100')
      );
    // get the redo images for that annotator
    else
      images = await ImageService.getProjectImageForAnnotator(
        id,
        userId,
        parseInt(take?.toString() || '100')
      );

    // build the images payload
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
    const { take = 100, skip = 0 } = req.query;
    const userId = req.user.id;

    const project = await Project.findById(id as string);

    if (!project)
      return res.status(400).send(appResponse('Invalid project id', false));

    // make sure that the client own the project
    if (project.userId !== userId)
      return res.status(403).send(appResponse('You are not allowed', false));

    // get pending review images for that client
    const images = await ImageService.getProjectPendingReviewImageForClient(
      id,
      +take,
      +skip
    );

    // build the payload
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
// get the images for qa
const getQAImagesForProject: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { take } = req.query;
    const userId = req.user.id;

    // check if the user is QA
    const isQA = await UserService.isQA(userId);

    if (!isQA)
      return res.status(403).send(appResponse('You are not allowed.', false));

    // get the images for that qa in this project
    const images = await ImageService.getProjectImageForQA(
      id,
      userId,
      parseInt(take?.toString() || '100')
    );

    // build the payload
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

// download output file
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

    // get images with annotations with done and pending client review status
    const images = await ImageService.getProjectImagesWithAnnotations(id, [
      ImageStatus.DONE,
      ImageStatus.PENDING_CLIENT_REVIEW,
    ]);

    // build a class map
    const classMap: any = {};
    project.classes.forEach((cl) => {
      classMap[cl._id.toString()] = cl;
    });

    // build the output file structure
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
            attributes: anno?.attributes,
          };
        }),
      };
    });

    const json = JSON.stringify(imagesPayload, undefined, 2);

    const path = await ProjectService.createOutputFile(project.name, json);

    // response with the file
    res.status(200).download(path, (error) => {
      if (error) {
        logger.error(error);
        throw new Error('can not send the file');
      }

      // delete the output file after download finished
      ProjectService.deleteOutputFile(path);
    });
  } catch (error) {
    logger.error(error);
    const response = appResponse('Error download output file', false);
    res.status(500).send(response);
  }
};

const deleteProject: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const permission = ac.can(user.role).deleteOwn(Resources.PROJECT);
    if (!permission.granted)
      return res.status(403).send(appResponse('You are not allowed', false));

    const project = await Project.findByIdAndDelete(id);
    if (!project)
      return res
        .status(404)
        .send(appResponse('This is not a valid project', false));

    const imagesIds = project.imagesIds.map((id) => id.toString());

    // remove project images from our database and S3 bucket
    await ImageService.removeImages(id, imagesIds, true);
    res.status(200).send({ success: true });
  } catch (error) {
    logger.error(error);
    res.status(500).send(appResponse('Error: Deleting a project data', false));
  }
};

export {
  createProject,
  addMetaDataToProject,
  CreateProjectForHUmanInLoop,
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
  getProjectId,
  addClasses,
  removeImages,
  deleteProject,
};

// --*-------------- PRIVATE

const updateWorkingProjectNumberForMembers = async (
  prevWorkingIds: number[],
  newWorkingIds: number[]
): Promise<void> => {
  // get the removed users to decrease the working project number for them
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

  // get the added users to increase the working project number for them
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
