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

const ProjectService = { getRemovedIds, getAddedIds, getQAsIds };

export default ProjectService;
