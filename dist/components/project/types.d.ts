import { ObjectId } from 'mongodb';
export interface IProject {
    _id: ObjectId;
    name: string;
    dueAt: Date;
    type: string;
    classes: ProjectClass[];
    imagesIds: ObjectId[];
    userId: number;
    imagesCount: number;
    annotationCount: number;
    annotationInProgressCount: number;
    qaCount: number;
    redoCount: number;
    clientReviewCount: number;
    doneCount: number;
    adminId: number;
    assignedAnnotators: number[];
    assignedQAs: number[];
    finished: boolean;
}
export interface ProjectClass {
    _id: ObjectId;
    name: string;
    color: string;
}
//# sourceMappingURL=types.d.ts.map