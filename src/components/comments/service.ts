import { IImage } from '../image/types';
import { ImageComment } from './model';
import { IImageComment } from './types';

const create = async (comment: IImageComment): Promise<void> => {
  await ImageComment.create(comment);
};

const getCommentsForImage = async (
  imageId: string
): Promise<IImageComment[]> => {
  return await ImageComment.find({ imageId });
};

const deleteImageComment = async (id: string) => {
  await ImageComment.findByIdAndDelete(id);
};

const ImageCommentService = {
  create,
  getCommentsForImage,
  deleteImageComment,
};

export default ImageCommentService;
