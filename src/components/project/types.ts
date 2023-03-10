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
  annotationInProgressCount: number;
  qaCount: number;
  redoCount: number;
  clientReviewCount: number;
  doneCount: number;

  // admins
  adminId: number;
  assignedAnnotators: number[];
  assignedQAs: number[];

  finished: boolean;

  attributes: ProjectMetaData[];

  sdkToken?: string;
}

export interface ProjectClass {
  _id: ObjectId;
  id: number;
  name: string;
  color: string;
}

export interface ProjectMetaData {
  name: string;
  type: string;
  displayName: string;
  classes: string;
  maxCharacters: number;
  defaultValue: string;
  descriptions: string;
  required: boolean;
}
