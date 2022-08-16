declare const ProjectService: {
    getRemovedIds: (prevIds: number[], newIds: number[]) => number[];
    getAddedIds: (prevIds: number[], newIds: number[]) => number[];
    getQAsIds: (projectId: string) => Promise<number[] | undefined>;
    getOwnerId: (projectId: string) => Promise<number | undefined>;
    updateCount: (projectId: string, counts: {
        annotationCount?: number;
        annotationInProgressCount?: number;
        qaCount?: number;
        redoCount?: number;
        clientReviewCount?: number;
        doneCount?: number;
    }) => Promise<void>;
    createOutputFile: (projectName: string, content: string) => Promise<string>;
    deleteOutputFile: (path: string) => void;
};
export default ProjectService;
//# sourceMappingURL=service.d.ts.map