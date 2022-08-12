import { Project } from './model';

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
  await Project.findByIdAndUpdate;
};

const ProjectService = {
  getRemovedIds,
  getAddedIds,
  getQAsIds,
  getOwnerId,
  updateCount,
};

export default ProjectService;
