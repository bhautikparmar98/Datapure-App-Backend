import { Annotation } from './model';
import { IAnnotation } from './types';

const createAnnotations = async (
  annotations: IAnnotation[]
): Promise<any[]> => {
  const purifiedAnnotations = annotations.map((a) => {
    const newShapes = a.shapes.map((s) => {
      const { x, y, width, height, id, points, type } = s;
      return { x, y, width, height, id, points, type };
    });

    return { ...a, shapes: newShapes };
  });

  const results = await Annotation.insertMany(purifiedAnnotations);
  return results.map((r) => r._id);
};

const createPreAnnotations = async (
  annotations: IAnnotation[],
  id: string,
  classes: any[]
) => {
  const classesMap: any = {};

  classes.forEach((c) => {
    classesMap[c.id] = c._id;
  });

  const purifiedAnnotations = annotations.map((a) => ({
    shapes: [...annotations],
    classId: classesMap[a.classId as any],
    imageId: id,
    visible: true,
  }));

  const results = await Annotation.insertMany(purifiedAnnotations);
  return results.map((r) => r._id);
};

const removeAllForImage = async (imageId: string): Promise<void> => {
  await Annotation.deleteMany({ imageId });
};

const AnnotationService = {
  createAnnotations,
  createPreAnnotations,
  removeAllForImage,
};
export default AnnotationService;
