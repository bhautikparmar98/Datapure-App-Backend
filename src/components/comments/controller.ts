import { RequestHandler } from 'express';
import logger from '../../loaders/logger';

import { appResponse } from '../../utils';
import { ImageComment } from './model';
import ImageCommentService from './service';

// only client will use this method to create a new register
const deleteImageComment: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    // get the id of comments from params
    const { id } = req.params;

    // finding comment with this id
    const comment = await ImageComment.findById(id);

    // if not comment return bad request
    if (!comment)
      return res.status(400).send(appResponse('Invalid comment id', false));

    // only user that create the comment can remove it otherwise return bad request
    if (comment.userId !== user.id)
      return res
        .status(400)
        .send(
          appResponse(
            'Only the creating of the comment can delete comment',
            false
          )
        );

    // delete comment from database
    await comment.delete();

    res.status(200).send({ success: true });
  } catch (err) {
    logger.error(err);
    const response = appResponse('Error deleting comment', false);
    res.status(500).send(response);
  }
};

// ---------- PRIVATE --------

export { deleteImageComment };
