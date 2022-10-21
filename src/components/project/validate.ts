import { Joi } from 'celebrate';
import { AnnotationTypes, Roles, ImageStatus } from '../../constants';

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

// `dataType` is for Human in loop & no `images` required
export const CreateProjectForHUmanInLoopSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  dueAt: Joi.date().required(),
  type: Joi.string().valid(AnnotationTypes.IMAGE_ANNOTATION).required(),
  dataType: Joi.string().valid(AnnotationTypes.HUMAN_IN_LOOP),

  classes: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().min(2).max(50).required(),
        color: Joi.string().min(2).max(50).required(),
      })
    )
    .required(),
});

export const CreatePreAnnotatedProjectSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  dueAt: Joi.date().required(),
  type: Joi.string()
    .valid(AnnotationTypes.IMAGE_ANNOTATION, AnnotationTypes.TEXT_ANNOTATION)
    .required(),
  dataType: Joi.string().valid(
    AnnotationTypes.IMAGE_ANNOTATION,
    AnnotationTypes.TEXT_ANNOTATION,
    AnnotationTypes.PRE_ANNOTATED_DATA
  ),
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().required(),
        fileName: Joi.string().required(),
        annotations: Joi.array()
          .items(
            Joi.object({
              x: Joi.number().required(),
              y: Joi.number().required(),
              width: Joi.number().required(),
              height: Joi.number().required(),
              id: Joi.any(),
              type: Joi.string().required(),
              classId: Joi.any().required(),
              attributes: Joi.any(),
            })
          )
          .required(),
      })
    )
    .required(),
  annotationType: Joi.string().required(),
  classes: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().min(2).max(50).required(),
        color: Joi.string().min(2).max(50).required(),
        id: Joi.any().required(),
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
        annotations: Joi.array()
          .items(
            Joi.object({
              x: Joi.number().required(),
              y: Joi.number().required(),
              width: Joi.number().required(),
              height: Joi.number().required(),
              id: Joi.any(),
              type: Joi.string().required(),
              classId: Joi.any().required(),
              attributes: Joi.any(),
            })
          )
          .required(),
      })
    )
    .required(),
  imgsStatus: Joi.string().valid(
    ImageStatus.PENDING_ANNOTATION,
    ImageStatus.ANNOTATION_INPROGRESS,
    ImageStatus.PENDING_REDO,
    ImageStatus.PENDING_CLIENT_REVIEW,
    ImageStatus.DONE,
    ImageStatus.PENDING_QA
  ),
});

export const RemoveImagesSchema = Joi.object({
  imageIds: Joi.array().items(Joi.string()).required(),
});

export const AddClassesSchema = Joi.object({
  classes: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        color: Joi.string().required(),
      })
    )
    .required(),
});

export const AssignAdminsToProjectSchema = Joi.object({
  adminId: Joi.number(),
});

export const AssignQAToProjectSchema = Joi.object({
  qaIds: Joi.array().items(Joi.number()),
});

export const AssignAnnotatorsToProjectSchema = Joi.object({
  annotatorIds: Joi.array().items(Joi.number()),
});
