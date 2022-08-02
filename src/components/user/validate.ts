import { Joi } from 'celebrate';
import { Roles } from '../../constants';

export const UserRegistrationSchema = Joi.object({
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  firstName: Joi.string().min(2).max(30).required(),
  lastName: Joi.string().min(2).max(30).required(),
  email: Joi.string().email().required(),
  company: Joi.string().min(2).max(50).required(),
});

export const UserLoginSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
});

export const UserInviteSchema = Joi.object({
  firstName: Joi.string().min(2).max(30).required(),
  lastName: Joi.string().min(2).max(30).required(),
  email: Joi.string().email().required(),
  company: Joi.string().min(2).max(50).required(),
  role: Joi.string()
    .valid(Roles.ADMIN, Roles.ANNATATOR, Roles.CLIENT, Roles.QA)
    .required(),
});
