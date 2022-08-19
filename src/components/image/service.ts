import aws from 'aws-sdk';
import config from '../../config';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import { IImage } from './types';
import mongoose, { ObjectId } from 'mongoose';
import { Image } from './model';
import { ImageStatus } from '../../constants';

const region = config.aws.s3.region;
const s3 = new aws.S3({
  accessKeyId: config.aws.keyId,
  secretAccessKey: config.aws.secretAccessKey,
  region,
  signatureVersion: 's3v4',
});

const defaultExtension = 'png';

const getSignedUrl = (file: string) => {
  const bucket = config.aws.s3.bucket;
  const result = file.split('.');

  const fileName = file;
  let extension = result[result.length - 1];

  if (!extension) {
    extension = defaultExtension;
  }

  const { contentStorageKey, contentStorageBucketName, contentType } = {
    contentStorageKey: uuidv4() + '-' + fileName,
    contentStorageBucketName: bucket,
    contentType: mime.contentType(extension),
  };

  const params = {
    Bucket: contentStorageBucketName,
    Key: contentStorageKey,
    Expires: 60 * 60 * 60, //1hour
    ContentType: contentType,
    ACL: 'public-read',
  };

  const presignedURL = s3.getSignedUrl('putObject', params);
  const url = `https://${bucket}.s3.${region}.amazonaws.com/${contentStorageKey}`;

  return { presignedURL, url, fileName };
};

const createImages = async (
  images: { url: string; fileName: string }[],
  projectId: any
): Promise<any[]> => {
  const payload = images.map((i) => ({
    src: i.url,
    fileName: i.fileName,
    projectId: new mongoose.Types.ObjectId(projectId),
    status: ImageStatus.PENDING_ANNOTATION,
  }));

  const results = await Image.insertMany(payload);
  return results.map((r) => r._id);
};

const getProjectImages = async (projectId: string) => {
  const images = await Image.find({ projectId });
  return images;
};

const equallyDistributeImagesBetweenAnnotators = async (
  projectId: string,
  annotatorsIds: number[]
): Promise<void> => {
  const promises = [];
  const availableImages: typeof images = [];
  // get all images for the project
  const images = await getProjectImages(projectId);

  // build a map for each annotator that count number of finished status he worked on
  const annoMap: any = {};
  annotatorsIds.forEach((id) => {
    annoMap[id.toString()] = 0;
  });

  let distributedImagesCount = 0;

  // loop throw the image to build the map
  /**
   *
   * We have two scenario for PENDING_IMAGES
   *  1- Image does not have annotatorId yet
   *      - We should count it as images need to work on
   *  2- Image already have annotatorId
   *      - The annotatorId already exist in our coming annotatorIds list
   *          - We should count it as images need to work on
   *      - The annotatorId does not exist in our coming list
   *
   */
  for (let i = 0; i < images.length; i++) {
    const img = images[i];

    // image need to work on
    if (
      [
        ImageStatus.PENDING_ANNOTATION,
        ImageStatus.ANNOTATION_INPROGRESS,
      ].includes(img.status)
    ) {
      availableImages.push(img);
      distributedImagesCount++;
    } else {
      // image is finished but we need to count it for it's perspective annotator
      // if annotator in our coming list
      // it's not possible to exist an image with no annotator in those status
      if (annoMap[img.annotatorId!.toString()]) {
        annoMap[img.annotatorId!.toString()] =
          annoMap[img.annotatorId!.toString()] + 1;
        distributedImagesCount++;
      }

      // if not this image is done and don't need to reassign it
    }
  }

  // if there is no image available we don't need to reassign
  if (availableImages.length === 0) return;

  const averageNumberToWorkOn = Math.floor(
    distributedImagesCount / annotatorsIds.length
  );

  // assign pending images depending on the count of working
  for (let i = 0; i < annotatorsIds.length; i++) {
    const id = annotatorsIds[i];

    if (annoMap[id] < averageNumberToWorkOn) {
      let remainingCount = averageNumberToWorkOn - annoMap[id];

      while (remainingCount) {
        const img = availableImages.pop();
        // assign id to the image
        img!.annotatorId = id;
        promises.push(img?.save());
        remainingCount--;
      }
    }

    // if we are in the last annotator and there is an remaining images we need to distribute it again
    if (i + 1 === annotatorsIds.length) {
      // the remind number of images that does not calc in avg
      let reminder = distributedImagesCount % annotatorsIds.length;
      let index = 0;

      while (reminder) {
        const img = availableImages.pop();
        // assign id to the image
        img!.annotatorId = annotatorsIds[index];
        promises.push(img?.save());

        index++;
        if (index === annotatorsIds.length) index = 0;
        reminder--;
      }
    }
  }

  await Promise.all(promises);
};

const getQAStatics = async (projectId: string, userId: number) => {
  const images = await Image.find({ projectId, qaId: userId });

  const pendingQA = images.filter(
    (img) => img.status === ImageStatus.PENDING_QA
  ).length;
  const submitted = images.length - pendingQA;

  return { pendingQA, submitted };
};

const getAnnotatorStatics = async (projectId: string, userId: number) => {
  const images = await Image.find({ projectId, annotatorId: userId });

  const pendingAnnotation = images.filter(
    (img) => img.status === ImageStatus.PENDING_ANNOTATION
  ).length;

  const pendingRedo = images.filter(
    (img) => img.status === ImageStatus.PENDING_REDO
  ).length;

  const submitted = images.length - pendingAnnotation - pendingRedo;

  return { pendingAnnotation, pendingRedo, submitted };
};

const assignQA = async (qaIds: number[], projectId: string, id: string) => {
  if (qaIds.length === 0) return Promise.resolve();
  if (qaIds.length === 1) {
    await Image.findByIdAndUpdate(id, { $set: { qaId: qaIds[0] } });
    return;
  }
  // get project qas ids
  const images = await Image.find({ qaId: { $in: qaIds }, projectId });

  // build the map to know the number of images assigned to him needed to work
  const qaMap: any = {};

  qaIds.forEach((qaId) => {
    qaMap[qaId] = 0;
  });

  // get the number of qa working on
  for (let i = 0; i < images.length; i++) {
    const element = images[i];

    if (element.status === ImageStatus.PENDING_QA)
      qaMap[element.qaId!] = qaMap[element.qaId!] + 1;
  }

  // get the minimum and assign it to the image id;
  let min = qaMap[qaIds[0]];
  let minimumId = qaIds[0];
  qaIds.forEach((qaId) => {
    if (qaMap[qaId] < min) {
      min = qaMap[qaId];
      minimumId = qaId;
    }
  });

  await await Image.findByIdAndUpdate(id, { $set: { qaId: minimumId } });
};

const getProjectImageForAnnotator = async (
  projectId: string,
  annotatorId: number,
  take = 10
) => {
  const images = await Image.find({
    projectId,
    annotatorId,
    status: {
      $in: [ImageStatus.PENDING_ANNOTATION, ImageStatus.ANNOTATION_INPROGRESS],
    },
  })
    .limit(take)
    .populate('projectId', 'classes')
    .populate('annotationIds');
  return images;
};

const getProjectRedoImageForAnnotator = async (
  projectId: string,
  annotatorId: number,
  take = 10
) => {
  const images = await Image.find({
    projectId,
    annotatorId,
    status: ImageStatus.PENDING_REDO,
  })
    .limit(take)
    .populate('projectId', 'classes')
    .populate('annotationIds');

  return images;
};

const getProjectImageForQA = async (
  projectId: string,
  qaId: number,
  take = 10
) => {
  const images = await Image.find({
    projectId,
    qaId,
    status: ImageStatus.PENDING_QA,
  })
    .limit(take)
    .populate('projectId', 'classes')
    .populate('annotationIds');

  return images;
};

const getProjectPendingReviewImageForClient = async (
  projectId: string,
  take = 10
) => {
  const images = await Image.find({
    projectId,
    status: ImageStatus.PENDING_CLIENT_REVIEW,
  })
    .limit(take)
    .populate('projectId', 'classes')
    .populate('annotationIds');

  return images;
};

const getProjectImagesWithAnnotations = async (
  projectId: string,
  statuses: string[]
) => {
  const images = await Image.find({
    projectId,
    status: { $in: statuses },
  }).populate('annotationIds');

  return images;
};

const ImageService = {
  getSignedUrl,
  createImages,
  getProjectImages,
  equallyDistributeImagesBetweenAnnotators,
  getQAStatics,
  getAnnotatorStatics,
  assignQA,
  getProjectImageForAnnotator,
  getProjectImageForQA,
  getProjectRedoImageForAnnotator,
  getProjectImagesWithAnnotations,
  getProjectPendingReviewImageForClient,
};
export default ImageService;
