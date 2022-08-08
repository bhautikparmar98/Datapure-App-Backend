import { ObjectId } from 'mongodb';

export interface IImage {
  _id: ObjectId;
  src: string;
  status: string;
  fileName: string;
  projectId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
