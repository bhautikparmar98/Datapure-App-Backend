import { RequestHandler } from 'express';
import db from '../../dbClient';
import logger from '../../loaders/logger';

import { Roles } from '../../constants';
import { appResponse } from '../../utils';
import UserService from './service';

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

    const hashedPassword = await UserService.getHashedPassword(password);

    const createdUser = await db.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        lastName,
        role: Roles.CLIENT,
        clientInfoId: createdClientInfo.id,
      },
    });

    res.status(201).send({ createdUser });
  } catch (err) {
    logger.error(err);

    const response = appResponse('Error creating user.', false);
    res.status(500).send(response);
  }
};

const checkAuthorization: RequestHandler = async (req, res) => {
  res.send('Iam here from the other side');
};

const loginUser: RequestHandler = async (req, res) => {
  try {
    const { password, email } = req.body;

    res.status(401).send({});
  } catch (e) {
    console.log(e);
  }
};

export { registerClient };
