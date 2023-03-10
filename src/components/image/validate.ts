import { Joi } from 'celebrate';
import { ShapeType } from '../../constants';

const ImageSignSchema = Joi.object({
  files: Joi.array().items(Joi.string()).required(),
  cloudFiles: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      link: Joi.string().optional(),
    })
  ),
});

const AddAnnotationSchema = Joi.object({
  annotations: Joi.array()
    .items(
      Joi.object({
        classId: Joi.string().required(),
        visible: Joi.bool(),
        shapes: Joi.array().items(
          Joi.object({
            x: Joi.number(),
            y: Joi.number(),
            width: Joi.number(),
            height: Joi.number(),
            id: Joi.string().required(),
            points: Joi.array().items(Joi.number()),
            type: Joi.string().valid(
              ShapeType.RECTANGLE,
              ShapeType.LINE,
              ShapeType.ERASER
            ),
            fill: Joi.any(),
            opacity: Joi.any(),
            stroke: Joi.any(),
          })
        ),
        attributes: Joi.any(),
      })
    )
    .required(),
});

const addImageCommentSchema = Joi.object({
  text: Joi.string().required(),
  x: Joi.number(),
  y: Joi.number(),
});

export { ImageSignSchema, AddAnnotationSchema, addImageCommentSchema };
