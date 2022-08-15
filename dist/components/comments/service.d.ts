import { IImageComment } from './types';
declare const ImageCommentService: {
    create: (comment: IImageComment) => Promise<void>;
    getCommentsForImage: (imageId: string) => Promise<IImageComment[]>;
    deleteImageComment: (id: string) => Promise<void>;
};
export default ImageCommentService;
//# sourceMappingURL=service.d.ts.map