import { ObjectId } from 'mongodb';
import { Annotation } from './model';
import { IAnnotation } from './types';

const createAnnotations = async (
  annotations: IAnnotation[]
): Promise<any[]> => {
  // loop over the annotations parameter to take only the allowed properties
  const purifiedAnnotations = annotations.map((a) => {
    // loop over shapes and take only allowed properties
    const newShapes = a.shapes.map((s) => {
      const { x, y, width, height, id, points, type } = s;
      return { x, y, width, height, id, points, type };
    });

    // overwrite the shapes field with the new shapes
    return { ...a, shapes: newShapes };
  });

  // insert the annotations in the db
  const results = await Annotation.insertMany(purifiedAnnotations);

  // return the inserted ids return [...ids]
  return results.map((r) => r._id);
};

const createPreAnnotations = async (
  annotations: IAnnotation[],
  id: string,
  classes: any[]
) => {
  // create a classes map
  const classesMap: any = {};

  classes.forEach((c) => {
    // create a map with the coming id and it's value is the generated id
    classesMap[c.id] = c._id;
  });

  // loop through coming annotations to create the annotations
  const purifiedAnnotations = annotations.map((a) => ({
    // spread the annotation coming from pre-annotated in the shapes with array of length 1
    shapes: [{ ...a }],
    // get the value of generated class id from the map[comingId]
    classId: classesMap[a.classId as any],
    imageId: id,
    visible: true,
    attributes: a.attributes
  }));

  // insert the annotations in the database
  const results = await Annotation.insertMany(purifiedAnnotations);

  return results.map((r) => r._id);
};

const removeAllForImage = async (imageId: string): Promise<void> => {
  // delete annotations for a specific image
  await Annotation.deleteMany({ imageId });
};

const removeAnnotationsWithIds = async (ids: ObjectId[]) => {
  await Annotation.deleteMany({ _id: { $in: ids } });
};

// export those  functions as object.
const AnnotationService = {
  createAnnotations,
  createPreAnnotations,
  removeAllForImage,
  removeAnnotationsWithIds,
};

export default AnnotationService;
