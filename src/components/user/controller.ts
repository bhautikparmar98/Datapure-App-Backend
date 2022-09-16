import { RequestHandler } from 'express';
import db from '../../dbClient';
import logger from '../../loaders/logger';

import { Resources, Roles } from '../../constants';
import { appResponse } from '../../utils';
import UserService from './service';
import ac from '../../utils/accesscontrol';
import { ClientInfo, User } from '@prisma/client';
import { Project } from '../project/model';
import ImageService from '../image/service';

// only client will use this method to create a new register
const registerClient: RequestHandler = async (req, res) => {
  try {
    const { password, email, firstName, lastName, company } = req.body;

    // get user with email
    const userExist = await db.user.findFirst({
      where: { email: { equals: email } },
    });

    // check if there is a user with the same email
    if (userExist)
      return res.status(400).send(appResponse('Email exist before.', false));

    // creating a clientInfo object
    const createdClientInfo = await db.clientInfo.create({
      data: { company },
    });

    // encrypt the password
    const { content, iv } = await UserService.encrypt(password);

    // create a user
    await db.user.create({
      data: {
        email,
        hashedPassword: content,
        iv,
        firstName,
        lastName,
        role: Roles.CLIENT,
        active: true,
        clientInfoId: createdClientInfo.id,
      },
    });

    res.status(201).send({ success: true });
  } catch (err) {
    logger.error(err);

    const response = appResponse('Error registering user.', false);
    res.status(500).send(response);
  }
};

const login: RequestHandler = async (req, res) => {
  try {
    const { password, email } = req.body;

    // get user with email
    const user = await db.user.findFirst({
      where: { email: { equals: email } },
    });

    // check if there is a user with the same email
    if (!user)
      return res.status(401).send(appResponse('Invalid Credentials.', false));

    // verify the password
    const isValidCred = await UserService.verifyPassword(
      {
        content: user.hashedPassword,
        iv: user.iv,
      },
      password
    );

    if (!isValidCred)
      return res.status(401).send(appResponse('Invalid Credentials.', false));

    // generate token to the authenticated user.
    const token = UserService.generateAuthToken({
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
      id: user.id,
      role: user.role,
    });

    res.status(201).send({ token });
  } catch (err) {
    logger.error(err);

    const response = appResponse('Error logging user.', false);
    res.status(500).send(response);
  }
};

const getAllUsers: RequestHandler = async (req, res) => {
  try {
    let { skip = 0, take = 5 } = req.query;

    const updatedSkip = parseInt(skip.toString());
    const updatedTake = parseInt(take.toString());

    // check the data
    const permission = ac.can(req.user.role).readAny('user');
    if (!permission.granted)
      return res.status(403).send(appResponse('You are not allowed', false));

    // queries
    const usersCount = await db.user.count({
      where: {
        role: { not: Roles.SUPER_ADMIN },
      },
    });

    // find user that is not super admin
    const users = await db.user.findMany({
      skip: updatedSkip,
      take: updatedTake,
      include: {
        clientInfo: true,
      },
      where: {
        role: { not: Roles.SUPER_ADMIN },
      },
    });

    // build the dtos
    const updatedUsers = users.map((u) => mapUserToDTO(u));

    res.send({ users: updatedUsers, totalCount: usersCount });
  } catch (error) {
    console.log('error');
    const response = appResponse('Error get all users', false);
    res.status(500).send(response);
  }
};

const inviteUser: RequestHandler = async (req, res) => {
  try {
    const { email, firstName, lastName, company, role } = req.body;

    // check the data
    const permission = ac.can(req.user.role).createAny('user');
    if (!permission.granted || role === Roles.SUPER_ADMIN)
      return res.status(403).send(appResponse('You are not allowed', false));

    // get user with email
    const userExist = await db.user.findFirst({
      where: { email: { equals: email } },
    });

    // check if there is a user with the same email
    if (userExist)
      return res.status(400).send(appResponse('Email exist before.', false));

    // created random password
    const password = UserService.generateRandomPassword();

    // creating a clientInfo object
    const createdClientInfo = await db.clientInfo.create({
      data: { company },
    });

    // encrypt password
    const { content, iv } = await UserService.encrypt(password);

    const createdUser = await db.user.create({
      data: {
        email,
        hashedPassword: content,
        iv,
        firstName,
        lastName,
        role,
        active: true,
        clientInfoId: createdClientInfo.id,
      },
    });

    // send email
    await UserService.sendInvitationMail(createdUser, password);

    res.status(201).send({
      user: mapUserToDTO({ ...createdUser, clientInfo: createdClientInfo }),
    });
  } catch (err) {
    logger.error(err);

    const response = appResponse('Error inviting user.', false);
    res.status(500).send(response);
  }
};

const getPassword: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // check the data
    const permission = ac.can(req.user.role).readAny('user');
    if (!permission.granted)
      return res.status(403).send(appResponse('You are not allowed', false));

    // get user with email
    const user = await db.user.findFirst({
      where: { id: { equals: +id } },
    });

    // check if there is a user with the same email
    if (!user) return res.status(400).send(appResponse('Invalid User.', false));

    if (user.role === Roles.SUPER_ADMIN)
      return res.status(403).send(appResponse('Not allowed.', false));
    // queries

    const password = UserService.decrypt({
      iv: user.iv,
      content: user.hashedPassword,
    });

    res.send({ password });
  } catch (error) {
    console.log('error');
    const response = appResponse('Error getting password', false);
    res.status(500).send(response);
  }
};

const getClientsProjects: RequestHandler = async (req, res) => {
  try {
    const permission = ac.can(req.user.role).readOwn(Resources.PROJECT);
    if (!permission.granted)
      return res.status(403).send(appResponse('You are not allowed', false));

    const { id } = req.params;

    // get all projects for this client
    const projects = await Project.find({ userId: id });
    const payloadProjects = projects.map((p) => p.toJSON());

    res.status(200).send({ projects: payloadProjects });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error getting client projects', false);
    res.status(500).send(response);
  }
};

const getAdminProjects: RequestHandler = async (req, res) => {
  try {
    const permission = ac.can(req.user.role).readOwn(Resources.PROJECT);
    if (!permission.granted)
      return res.status(403).send(appResponse('You are not allowed', false));

    const { id } = req.user;

    // get all project that is assigned for this admin and not finished yet
    const projects = await Project.find({ adminId: id, finished: false });
    const payloadProjects = projects.map((p) => p.toJSON());

    res.status(200).send({ projects: payloadProjects });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error getting admin projects', false);
    res.status(500).send(response);
  }
};

const getQAProjects: RequestHandler = async (req, res) => {
  try {
    const permission = ac.can(req.user.role).readOwn(Resources.PROJECT);
    if (!permission.granted)
      return res.status(403).send(appResponse('You are not allowed', false));

    const { id } = req.user;
    const countsArr = [];

    // get projects that the qa is assigned in project
    const projects = await Project.find({ assignedQAs: id, finished: false });
    const payloadProjects = projects.map((p) => p.toJSON());

    for (let i = 0; i < payloadProjects.length; i++) {
      const p = payloadProjects[i];
      // get counts for qa statics
      const counts = await ImageService.getQAStatics(p._id as any, id);
      countsArr.push({ ...counts, projectId: p._id });
    }

    res.status(200).send({ projects: payloadProjects, QACounts: countsArr });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error getting admin projects', false);
    res.status(500).send(response);
  }
};

const getAnnotatorProjects: RequestHandler = async (req, res) => {
  try {
    const permission = ac.can(req.user.role).readOwn(Resources.PROJECT);
    if (!permission.granted)
      return res.status(403).send(appResponse('You are not allowed', false));

    const { id } = req.user;
    const countsArr = [];

    const projects = await Project.find({
      assignedAnnotators: id,
      finished: false,
    });

    const payloadProjects = projects.map((p) => p.toJSON());

    for (let i = 0; i < payloadProjects.length; i++) {
      const p = payloadProjects[i];
      // get counts for annotator
      const counts = await ImageService.getAnnotatorStatics(p._id as any, id);
      countsArr.push({ ...counts, projectId: p._id });
    }

    res
      .status(200)
      .send({ projects: payloadProjects, annotatorCounts: countsArr });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error getting admin projects', false);
    res.status(500).send(response);
  }
};

const getClients: RequestHandler = async (req, res) => {
  try {
    const users = await getUsersByRole(Roles.CLIENT);
    // get clients
    const updatedUsers = users.map((u) => mapUserToDTO(u));
    res.send({ clients: updatedUsers });
  } catch (error) {
    console.log('error');
    const response = appResponse('Error get all clients', false);
    res.status(500).send(response);
  }
};

// get all admins
const getAdmins: RequestHandler = async (req, res) => {
  try {
    const admins = await getUsersByRole(Roles.ADMIN);
    const updatedUsers = admins.map((u) => mapUserToDTO(u));
    res.send({ admins: updatedUsers });
  } catch (error) {
    console.log('error');
    const response = appResponse('Error get all Admins', false);
    res.status(500).send(response);
  }
};

// get all qas
const getQAs: RequestHandler = async (req, res) => {
  try {
    const qas = await getUsersByRole(Roles.QA);
    const updatedUsers = qas.map((u) => mapUserToDTO(u));
    res.send({ qas: updatedUsers });
  } catch (error) {
    console.log('error');
    const response = appResponse('Error get all Admins', false);
    res.status(500).send(response);
  }
};

// get all annotators
const getAnnotators: RequestHandler = async (req, res) => {
  try {
    const annotators = await getUsersByRole(Roles.ANNOTATOR);
    const updatedUsers = annotators.map((u) => mapUserToDTO(u));
    res.send({ annotators: updatedUsers });
  } catch (error) {
    console.log('error');
    const response = appResponse('Error get all Admins', false);
    res.status(500).send(response);
  }
};

// ------------------ PRIVATE METHODS ---------------

// methods that return all users with a specific role
const getUsersByRole = async (role: keyof typeof Roles) => {
  return await db.user.findMany({
    include: {
      clientInfo: true,
    },
    where: {
      role,
      active: true,
    },
  });
};

// build the dto object
const mapUserToDTO = (
  user: User & {
    clientInfo?: ClientInfo | null;
  }
) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: `${user.firstName} ${user.lastName}`,
  role: user.role,
  email: user.email,
  numberOfActiveProjects: user.numberOfActiveProjects,
  clientInfo: user.clientInfo,
});

export {
  registerClient,
  login,
  getAllUsers,
  inviteUser,
  getPassword,
  getClientsProjects,
  getClients,
  getAdmins,
  getAdminProjects,
  getQAs,
  getAnnotators,
  getQAProjects,
  getAnnotatorProjects,
};
