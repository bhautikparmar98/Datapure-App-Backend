import { ObjectId } from 'mongodb';
export interface IImage {
    _id: ObjectId;
    src: string;
    status: string;
    fileName: string;
    dateAnnotated?: Date;
    projectId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
    annotatorId?: number;
    qaId?: number;
    annotationIds: number[];
}
//# sourceMappingURL=types.d.ts.map