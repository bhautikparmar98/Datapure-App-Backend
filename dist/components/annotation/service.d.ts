import { IAnnotation } from './types';
declare const AnnotationService: {
    createAnnotations: (annotations: IAnnotation[]) => Promise<any[]>;
    removeAllForImage: (imageId: string) => Promise<void>;
};
export default AnnotationService;
//# sourceMappingURL=service.d.ts.map