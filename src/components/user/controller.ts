import { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import { User } from './model';
import logger from '../../loaders/logger';

import { appResponse } from '../../utils';

const registerUser: RequestHandler = async (req, res) => {
  try {
    const { username, password, email, name } = req.body;

    res.status(201).send({});
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

export { registerUser };
