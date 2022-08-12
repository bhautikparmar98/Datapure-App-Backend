import { ObjectId } from 'mongodb';

export interface IInstance {
  type: string;
  id: string;
  _id?: ObjectId;
  x?: number;
  y?: number;
  width?: number;
  points?: number[];
}

export interface IIAnnotation {
  _id: ObjectId;
  classId: ObjectId;
  imageId: ObjectId;
  visible: boolean;
  shapes: IInstance[];
}
