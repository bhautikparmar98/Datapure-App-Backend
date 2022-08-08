import { ObjectId } from 'mongodb';
import { IImage } from '../image/types';

export interface IProject {
  _id: ObjectId;
  name: string;
  dueAt: Date;
  type: string;
  classes: ProjectClass[];
  imagesIds: ObjectId[];
  userId: number;

  // status static
  imagesCount: number;
  annotationCount: number;
  qaCount: number;
  clientReviewCount: number;
  doneCount: number;

  // admins
  adminId: number;
}

export interface ProjectClass {
  _id: ObjectId;
  name: string;
  color: string;
}
