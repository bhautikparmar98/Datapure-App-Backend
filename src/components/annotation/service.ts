import aws from 'aws-sdk';
import config from '../../config';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import { IImage } from './types';
import mongoose, { ObjectId } from 'mongoose';
import { Image } from './model';
import { ImageStatus } from '../../constants';
import ProjectService from '../project/service';

const AnnotationService = {};
export default AnnotationService;
