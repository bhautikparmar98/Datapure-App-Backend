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
    status: ImageStatus.ANNOTATION,
  }));

  const results = await Image.insertMany(payload);
  return results.map((r) => r._id);
};

const getProjectImages = async (projectId: string) => {
  const images = await Image.find({ projectId });
  return images;
};

const ImageService = { getSignedUrl, createImages, getProjectImages };
export default ImageService;
