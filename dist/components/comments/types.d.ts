import { ObjectId } from 'mongodb';
export interface IImageComment {
    _id?: ObjectId;
    imageId: ObjectId;
    userId: number;
    text: string;
    x: number;
    y: number;
}
//# sourceMappingURL=types.d.ts.map