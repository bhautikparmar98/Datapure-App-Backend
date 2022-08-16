import { Project } from './model';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';

const getRemovedIds = (prevIds: number[], newIds: number[]): number[] => {
  return prevIds.filter((prevId) => !newIds.includes(prevId));
};

const getAddedIds = (prevIds: number[], newIds: number[]): number[] => {
  return newIds.filter((newId) => !prevIds.includes(newId));
};

const getQAsIds = async (projectId: string) => {
  const project = await Project.findById(projectId);
  return project?.assignedQAs;
};

const getOwnerId = async (projectId: string) => {
  const project = await Project.findById(projectId);
  return project?.userId;
};

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

  await Project.findByIdAndUpdate(projectId, { $inc: { ...data } });
};

const createOutputFile = async (
  projectName: string,
  content: string
): Promise<string> => {
  const now = new Date();

  const date =
    now.getFullYear() + ' ' + (now.getMonth() + 1) + ' ' + now.getDate();
  const time = now.getHours() + ' ' + now.getMinutes() + ' ' + now.getSeconds();

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
};

export default ProjectService;
