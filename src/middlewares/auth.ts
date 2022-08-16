import jwt from 'jsonwebtoken';
import db from '../dbClient';
import config from '../config';
import { RequestHandler } from 'express';

const auth: RequestHandler = async (req, res, next) => {
  try {
    const token = req.header('x-access-token')?.replace('bearer ', '');
    if (!token) throw new Error('');

    const decoded = jwt.verify(token, config.jwtSecret);

    if (!decoded || typeof decoded === 'string') throw new Error('');

    const user = await db.user.findFirst({ where: { id: decoded.id } });

    if (!user) {
      throw new Error('');
    }

    req.token = token;
    req.user = { ...user, fullName: `${user.firstName} ${user.lastName}` };
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

export default auth;
