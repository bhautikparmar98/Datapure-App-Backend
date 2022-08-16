import { IImage } from './types';
import mongoose from 'mongoose';
declare const ImageService: {
    getSignedUrl: (file: string) => {
        presignedURL: string;
        url: string;
        fileName: string;
    };
    createImages: (images: {
        url: string;
        fileName: string;
    }[], projectId: any) => Promise<any[]>;
    getProjectImages: (projectId: string) => Promise<(mongoose.Document<unknown, any, IImage> & IImage & Required<{
        _id: import("bson").ObjectID;
    }>)[]>;
    equallyDistributeImagesBetweenAnnotators: (projectId: string, annotatorsIds: number[]) => Promise<void>;
    getQAStatics: (projectId: string, userId: number) => Promise<{
        pendingQA: number;
        submitted: number;
    }>;
    getAnnotatorStatics: (projectId: string, userId: number) => Promise<{
        pendingAnnotation: number;
        pendingRedo: number;
        submitted: number;
    }>;
    assignQA: (qaIds: number[], projectId: string, id: string) => Promise<void>;
    getProjectImageForAnnotator: (projectId: string, annotatorId: number, take?: number) => Promise<Omit<Omit<mongoose.Document<unknown, any, IImage> & IImage & Required<{
        _id: import("bson").ObjectID;
    }>, never>, never>[]>;
    getProjectImageForQA: (projectId: string, qaId: number, take?: number) => Promise<Omit<Omit<mongoose.Document<unknown, any, IImage> & IImage & Required<{
        _id: import("bson").ObjectID;
    }>, never>, never>[]>;
    getProjectRedoImageForAnnotator: (projectId: string, annotatorId: number, take?: number) => Promise<Omit<Omit<mongoose.Document<unknown, any, IImage> & IImage & Required<{
        _id: import("bson").ObjectID;
    }>, never>, never>[]>;
    getProjectImagesWithAnnotations: (projectId: string, statuses: string[]) => Promise<Omit<mongoose.Document<unknown, any, IImage> & IImage & Required<{
        _id: import("bson").ObjectID;
    }>, never>[]>;
};
export default ImageService;
//# sourceMappingURL=service.d.ts.map