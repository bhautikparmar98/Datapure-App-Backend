import { RequestHandler } from 'express';
import db from '../../dbClient';
import logger from '../../loaders/logger';

import { Roles } from '../../constants';
import { appResponse } from '../../utils';
import UserService from './service';
import ac from '../../utils/accesscontrol';
import { ClientInfo, User } from '@prisma/client';

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

    const { content, iv } = await UserService.encrypt(password);

    await db.user.create({
      data: {
        email,
        hashedPassword: content,
        iv,
        firstName,
        lastName,
        role: Roles.CLIENT,
        clientInfoId: createdClientInfo.id,
      },
    });

    res.status(201).send({ success: true });
  } catch (err) {
    logger.error(err);

    const response = appResponse('Error creating user.', false);
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

    const token = UserService.generateAuthToken({
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
      id: user.id,
      role: user.role,
    });

    res.status(201).send({ token });
  } catch (err) {
    logger.error(err);

    const response = appResponse('Error creating user.', false);
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

    const { content, iv } = await UserService.encrypt(password);

    const createdUser = await db.user.create({
      data: {
        email,
        hashedPassword: content,
        iv,
        firstName,
        lastName,
        role,
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

    const response = appResponse('Error creating user.', false);
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
    const response = appResponse('Error get all users', false);
    res.status(500).send(response);
  }
};

const mapUserToDTO = (
  user: User & {
    clientInfo: ClientInfo | null;
  }
) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  email: user.email,
  clientInfo: user.clientInfo,
});

export { registerClient, login, getAllUsers, inviteUser, getPassword };
