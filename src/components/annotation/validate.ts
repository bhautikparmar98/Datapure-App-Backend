import { Joi } from 'celebrate';
import { ShapeType } from '../../constants';

const AnnotationSchema = Joi.object({
  classId: Joi.string().required(),
  imageId: Joi.string().required(),
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
    })
  ),
});

export { AnnotationSchema };
