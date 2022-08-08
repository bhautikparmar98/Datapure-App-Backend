import { Joi } from 'celebrate';

const ImageSignSchema = Joi.object({
  files: Joi.array().items(Joi.string()).required(),
});

export { ImageSignSchema };
