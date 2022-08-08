import { Joi } from 'celebrate';
import { AnnotationTypes, Roles } from '../../constants';

export const CreateProject = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  dueAt: Joi.date().required(),
  type: Joi.string()
    .valid(AnnotationTypes.IMAGE_ANNOTATION, AnnotationTypes.TEXT_ANNOTATION)
    .required(),
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().required(),
        fileName: Joi.string().required(),
      })
    )
    .required(),
  classes: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().min(2).max(50).required(),
        color: Joi.string().min(2).max(50).required(),
      })
    )
    .required(),
});

export const AddImageToProjectSchema = Joi.object({
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().required(),
        fileName: Joi.string().required(),
      })
    )
    .required(),
});

export const AssignAdminsToProjectSchema = Joi.object({
  adminId: Joi.number(),
});
