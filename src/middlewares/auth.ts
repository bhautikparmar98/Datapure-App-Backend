import jwt from 'jsonwebtoken';
import db from '../dbClient';
import config from '../config';
import { RequestHandler } from 'express';

const auth: RequestHandler = async (req, res, next) => {
  try {
    // get token from request that name "z-access-token" and remove bearer from it
    const token = req.header('x-access-token')?.replace('bearer ', '');

    // if token does not exist return error
    if (!token)
      throw new Error('Token should be provided in the header of the request.');

    // verify the token with the secret to make sure the token is valid and no one manipulate it.
    const decoded = jwt.verify(token, config.jwtSecret);

    // if the token is not valid return error
    if (!decoded || typeof decoded === 'string')
      throw new Error('Verifying token is failed.');

    // find user with the id stored in the token
    const user = await db.user.findFirst({ where: { id: decoded.id } });

    // checking if the user is not exist
    if (!user) {
      throw new Error('There is no user matched the id in the token');
    }

    // inject token in the request object
    req.token = token;

    // inject user in the request object and create a fullName property on the fly.
    req.user = { ...user, fullName: `${user.firstName} ${user.lastName}` };

    // continue to other middleware of controller
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

export default auth;
