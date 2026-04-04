import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';
import * as sharp from 'sharp';
import { S3Client, PutObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import { EnvService } from '../../../config/env.config';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private storageBucketEndpoint: string;

  constructor(private envService: EnvService) {
    this.bucketName = this.envService.get('S3_STORAGE_BUCKET_NAME');
    this.storageBucketEndpoint = this.envService.get('S3_STORAGE_BUCKET_ENDPOINT');
    this.s3Client = new S3Client({
      forcePathStyle: true,
      endpoint: this.envService.get('S3_STORAGE_ENDPOINT'),
      region: this.envService.get('S3_STORAGE_REGION'),
      credentials: {
        accessKeyId: this.envService.get('S3_STORAGE_ACCESS_KEY_ID'),
        secretAccessKey: this.envService.get('S3_STORAGE_SECRET_ACCESS_KEY'),
      },
    });
  }

  private async compressImage(buffer: Buffer): Promise<Buffer> {
    const compressedBuffer = await sharp(buffer).toFormat('png', { quality: 60 }).toBuffer();
    return compressedBuffer;
  }

  /**
   * Uploads an image file to S3.
   * @param file - The file to upload to the S3 bucket.
   * @param folder - The folder in which to store the file.
   * @returns URL - Public URL for the uploaded object
   */
  async uploadImageFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      const compressedImage = await this.compressImage(file.buffer);
      const fileKey = `${folder}/${uuidV4()}.png`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: compressedImage,
        ACL: 'public-read',
        ContentType: 'image/png',
      });

      await this.s3Client.send(command);
      console.log('Successfully uploaded object to s3');

      return `${this.storageBucketEndpoint}/${fileKey}`;
    } catch (err) {
      console.error(`S3 Upload Error: ${JSON.stringify(err, null, 2)}`);

      if (err instanceof S3ServiceException) {
        console.error('S3 Service Exception:', err.name, err.message);

        switch (err.name) {
          case 'AccessDenied':
            console.log('Access Denied: Access to s3 storage denied');
            throw new InternalServerErrorException('File upload failed.');
          case 'NoSuchBucket':
            console.log('NoSuchBucket: The specified bucket does not exist.');
            throw new InternalServerErrorException('File upload failed.');
          case 'NetworkingError':
            console.log('NetworkingError: A network error occurred. Check your connection.');
            throw new InternalServerErrorException('File upload failed.');
          case 'EntityTooLarge':
            console.log(
              'EntityTooLarge: File is too large. Use multipart uploads for large files..'
            );
            throw new BadRequestException('File is too large');
          default:
            console.log(`Unknown Error: ${err.message || 'No message available'}`);
            throw new InternalServerErrorException('File upload failed.');
        }
      } else {
        console.log('Unknown Error');
        console.error(err);
        throw new InternalServerErrorException('File upload failed.');
      }
    }
  }

  /**
   * Uploads a video file to S3.
   * @param file - The video file to upload.
   * @param folder - The folder in which to store the file.
   * @returns URL - Public URL for the uploaded video
   */
  async uploadVideoFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      // Get file extension from mimetype
      const extensionMap: Record<string, string> = {
        'video/mp4': 'mp4',
        'video/webm': 'webm',
        'video/quicktime': 'mov',
        'video/x-msvideo': 'avi',
        'video/x-matroska': 'mkv',
      };
      const extension = extensionMap[file.mimetype] || 'mp4';
      const fileKey = `${folder}/${uuidV4()}.${extension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype || 'video/mp4',
      });

      await this.s3Client.send(command);
      console.log('Successfully uploaded video to s3');

      return `${this.storageBucketEndpoint}/${fileKey}`;
    } catch (err) {
      console.error(`S3 Video Upload Error: ${JSON.stringify(err, null, 2)}`);

      if (err instanceof S3ServiceException) {
        switch (err.name) {
          case 'EntityTooLarge':
            throw new BadRequestException('Video file is too large');
          default:
            throw new InternalServerErrorException('Video upload failed.');
        }
      }
      throw new InternalServerErrorException('Video upload failed.');
    }
  }

  /**
   * Uploads a generic file to S3 (preserves original format).
   * Supports images, PDFs, and other document types.
   * @param file - The file to upload.
   * @param folder - The folder in which to store the file.
   * @returns URL - Public URL for the uploaded file
   */
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      // Get file extension from mimetype or original name
      const extensionMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      };

      let extension = extensionMap[file.mimetype];
      if (!extension && file.originalname) {
        const parts = file.originalname.split('.');
        extension = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'bin';
      }
      extension = extension || 'bin';

      const fileKey = `${folder}/${uuidV4()}.${extension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype || 'application/octet-stream',
      });

      await this.s3Client.send(command);
      console.log('Successfully uploaded file to s3');

      return `${this.storageBucketEndpoint}/${fileKey}`;
    } catch (err) {
      console.error(`S3 File Upload Error: ${JSON.stringify(err, null, 2)}`);

      if (err instanceof S3ServiceException) {
        switch (err.name) {
          case 'EntityTooLarge':
            throw new BadRequestException('File is too large');
          default:
            throw new InternalServerErrorException('File upload failed.');
        }
      }
      throw new InternalServerErrorException('File upload failed.');
    }
  }
}
