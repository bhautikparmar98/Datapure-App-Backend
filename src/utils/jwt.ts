import config from '../config';

import jwt from 'jsonwebtoken';

type GenerateAuthToken = (props: {
  payload: {
    email: string;
    fullName: string;
    id: number; //user id
    role: string;
    projectId: string;
  };
  expire?: string;
}) => string;

const generateAuthToken: GenerateAuthToken = ({ payload, expire = '60d' }) => {
  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: expire,
  });

  return token;
};

export { generateAuthToken };
