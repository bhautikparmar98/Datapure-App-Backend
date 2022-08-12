import { Annotation } from './model';
import { IAnnotation } from './types';

const createAnnotations = async (
  annotations: IAnnotation[]
): Promise<any[]> => {
  const results = await Annotation.insertMany(annotations);
  return results.map((r) => r._id);
};

const removeAllForImage = async (imageId: string): Promise<void> => {
  await Annotation.deleteMany({ imageId });
};

const AnnotationService = {
  createAnnotations,
  removeAllForImage,
};
export default AnnotationService;
