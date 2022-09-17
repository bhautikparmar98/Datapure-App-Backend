import { Project } from './model';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import { ProjectClass } from './types';

// get removed ids that exist in prevIds and remove from newIds
const getRemovedIds = (prevIds: number[], newIds: number[]): number[] => {
  return prevIds.filter((prevId) => !newIds.includes(prevId));
};

// get the added ids that exist on newIds and does not exist in prevIds
const getAddedIds = (prevIds: number[], newIds: number[]): number[] => {
  return newIds.filter((newId) => !prevIds.includes(newId));
};

// get QA ids
const getQAsIds = async (projectId: string) => {
  const project = await Project.findById(projectId);
  return project?.assignedQAs;
};

// get the owner id for the project
const getOwnerId = async (projectId: string) => {
  const project = await Project.findById(projectId);
  return project?.userId;
};

// update count for the project
const updateCount = async (
  projectId: string,
  counts: {
    annotationCount?: number;
    annotationInProgressCount?: number;
    qaCount?: number;
    redoCount?: number;
    clientReviewCount?: number;
    doneCount?: number;
  }
) => {
  const data: any = { ...counts };

  Object.keys(data).forEach((k: any) => {
    if (!data[k]) delete data[k];
  });

  // find the project id and update the counts
  await Project.findByIdAndUpdate(projectId, { $inc: { ...data } });
};

// add classes for a project
const addClasses = async (projectId: string, classes: ProjectClass[]) => {
  await Project.findByIdAndUpdate(projectId, {
    $push: { classes: { $each: classes } },
  });
};

// create the output file
const createOutputFile = async (
  projectName: string,
  content: string
): Promise<string> => {
  const now = new Date();

  const date =
    now.getFullYear() + ' ' + (now.getMonth() + 1) + ' ' + now.getDate();
  const time = now.getHours() + ' ' + now.getMinutes() + ' ' + now.getSeconds();

  // create a file name for the project
  const filename = `${projectName} ${date} ${time}.json`;
  let absPath = path.join(path.resolve('./'), '/temp_files/', filename);
  let relPath = path.join('./temp_files', filename); // path relative to server root

  await mkdirp('./temp_files');
  fs.writeFileSync(relPath, content);

  return absPath;
};

const deleteOutputFile = (path: string) => {
  fs.unlinkSync(path);
};

const ProjectService = {
  getRemovedIds,
  getAddedIds,
  getQAsIds,
  getOwnerId,
  updateCount,
  createOutputFile,
  deleteOutputFile,
  addClasses,
};

export default ProjectService;
