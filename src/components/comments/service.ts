import { IImage } from '../image/types';
import { ImageComment } from './model';
import { IImageComment } from './types';

//  service to create image comment in the database
const create = async (comment: IImageComment): Promise<void> => {
  await ImageComment.create(comment);
};

// get comments for image id
const getCommentsForImage = async (
  imageId: string
): Promise<IImageComment[]> => {
  // find comments for this image
  return await ImageComment.find({ imageId });
};

// delete one comment by id
const deleteImageComment = async (id: string) => {
  await ImageComment.findByIdAndDelete(id);
};

const ImageCommentService = {
  create,
  getCommentsForImage,
  deleteImageComment,
};

export default ImageCommentService;
