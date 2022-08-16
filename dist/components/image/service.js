"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const config_1 = __importDefault(require("../../config"));
const uuid_1 = require("uuid");
const mime_types_1 = __importDefault(require("mime-types"));
const mongoose_1 = __importDefault(require("mongoose"));
const model_1 = require("./model");
const constants_1 = require("../../constants");
const region = config_1.default.aws.s3.region;
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: config_1.default.aws.keyId,
    secretAccessKey: config_1.default.aws.secretAccessKey,
    region,
});
const defaultExtension = 'png';
const getSignedUrl = (file) => {
    const bucket = config_1.default.aws.s3.bucket;
    const result = file.split('.');
    const fileName = file;
    let extension = result[result.length - 1];
    if (!extension) {
        extension = defaultExtension;
    }
    const { contentStorageKey, contentStorageBucketName, contentType } = {
        contentStorageKey: (0, uuid_1.v4)() + '-' + fileName,
        contentStorageBucketName: bucket,
        contentType: mime_types_1.default.contentType(extension),
    };
    const params = {
        Bucket: contentStorageBucketName,
        Key: contentStorageKey,
        Expires: 60 * 60 * 60,
        ContentType: contentType,
        ACL: 'public-read',
    };
    const presignedURL = s3.getSignedUrl('putObject', params);
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${contentStorageKey}`;
    return { presignedURL, url, fileName };
};
const createImages = async (images, projectId) => {
    const payload = images.map((i) => ({
        src: i.url,
        fileName: i.fileName,
        projectId: new mongoose_1.default.Types.ObjectId(projectId),
        status: constants_1.ImageStatus.PENDING_ANNOTATION,
    }));
    const results = await model_1.Image.insertMany(payload);
    return results.map((r) => r._id);
};
const getProjectImages = async (projectId) => {
    const images = await model_1.Image.find({ projectId });
    return images;
};
const equallyDistributeImagesBetweenAnnotators = async (projectId, annotatorsIds) => {
    const promises = [];
    const availableImages = [];
    const images = await getProjectImages(projectId);
    const annoMap = {};
    annotatorsIds.forEach((id) => {
        annoMap[id.toString()] = 0;
    });
    let distributedImagesCount = 0;
    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if ([
            constants_1.ImageStatus.PENDING_ANNOTATION,
            constants_1.ImageStatus.ANNOTATION_INPROGRESS,
        ].includes(img.status)) {
            availableImages.push(img);
            distributedImagesCount++;
        }
        else {
            if (annoMap[img.annotatorId.toString()]) {
                annoMap[img.annotatorId.toString()] =
                    annoMap[img.annotatorId.toString()] + 1;
                distributedImagesCount++;
            }
        }
    }
    if (availableImages.length === 0)
        return;
    const averageNumberToWorkOn = Math.floor(distributedImagesCount / annotatorsIds.length);
    for (let i = 0; i < annotatorsIds.length; i++) {
        const id = annotatorsIds[i];
        if (annoMap[id] < averageNumberToWorkOn) {
            let remainingCount = averageNumberToWorkOn - annoMap[id];
            while (remainingCount) {
                const img = availableImages.pop();
                img.annotatorId = id;
                promises.push(img === null || img === void 0 ? void 0 : img.save());
                remainingCount--;
            }
        }
        if (i + 1 === annotatorsIds.length) {
            let reminder = distributedImagesCount % annotatorsIds.length;
            let index = 0;
            while (reminder) {
                const img = availableImages.pop();
                img.annotatorId = annotatorsIds[index];
                promises.push(img === null || img === void 0 ? void 0 : img.save());
                index++;
                if (index === annotatorsIds.length)
                    index = 0;
                reminder--;
            }
        }
    }
    await Promise.all(promises);
};
const getQAStatics = async (projectId, userId) => {
    const images = await model_1.Image.find({ projectId, qaId: userId });
    const pendingQA = images.filter((img) => img.status === constants_1.ImageStatus.PENDING_QA).length;
    const submitted = images.length - pendingQA;
    return { pendingQA, submitted };
};
const getAnnotatorStatics = async (projectId, userId) => {
    const images = await model_1.Image.find({ projectId, annotatorId: userId });
    const pendingAnnotation = images.filter((img) => img.status === constants_1.ImageStatus.PENDING_ANNOTATION).length;
    const pendingRedo = images.filter((img) => img.status === constants_1.ImageStatus.PENDING_REDO).length;
    const submitted = images.length - pendingAnnotation - pendingRedo;
    return { pendingAnnotation, pendingRedo, submitted };
};
const assignQA = async (qaIds, projectId, id) => {
    if (qaIds.length === 0)
        return Promise.resolve();
    if (qaIds.length === 1) {
        await model_1.Image.findByIdAndUpdate(id, { $set: { qaId: qaIds[0] } });
        return;
    }
    const images = await model_1.Image.find({ qaId: { $in: qaIds }, projectId });
    const qaMap = {};
    qaIds.forEach((qaId) => {
        qaMap[qaId] = 0;
    });
    for (let i = 0; i < images.length; i++) {
        const element = images[i];
        if (element.status === constants_1.ImageStatus.PENDING_QA)
            qaMap[element.qaId] = qaMap[element.qaId] + 1;
    }
    let min = qaMap[qaIds[0]];
    let minimumId = qaIds[0];
    qaIds.forEach((qaId) => {
        if (qaMap[qaId] < min) {
            min = qaMap[qaId];
            minimumId = qaId;
        }
    });
    await await model_1.Image.findByIdAndUpdate(id, { $set: { qaId: minimumId } });
};
const getProjectImageForAnnotator = async (projectId, annotatorId, take = 10) => {
    const images = await model_1.Image.find({
        projectId,
        annotatorId,
        status: {
            $in: [constants_1.ImageStatus.PENDING_ANNOTATION, constants_1.ImageStatus.ANNOTATION_INPROGRESS],
        },
    })
        .limit(take)
        .populate('projectId', 'classes')
        .populate('annotationIds');
    return images;
};
const getProjectRedoImageForAnnotator = async (projectId, annotatorId, take = 10) => {
    const images = await model_1.Image.find({
        projectId,
        annotatorId,
        status: constants_1.ImageStatus.PENDING_REDO,
    })
        .limit(take)
        .populate('projectId', 'classes')
        .populate('annotationIds');
    return images;
};
const getProjectImageForQA = async (projectId, qaId, take = 10) => {
    const images = await model_1.Image.find({
        projectId,
        qaId,
        status: constants_1.ImageStatus.PENDING_QA,
    })
        .limit(take)
        .populate('projectId', 'classes')
        .populate('annotationIds');
    return images;
};
const getProjectImagesWithAnnotations = async (projectId, statuses) => {
    const images = await model_1.Image.find({
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
};
exports.default = ImageService;
