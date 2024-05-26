import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private config: ConfigService) {}

  private V2 = v2.config({
    cloud_name: this.config.get('CLOUDINARY_NAME'),
    api_key: this.config.get('CLOUDINARY_API_KEY'),
    api_secret: this.config.get('CLOUDINARY_API_SECRET'),
  });

  async storeImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    if (!file) throw new BadRequestException('file is required');
    return new Promise((resolve, reject) => {
      v2.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder,
          },
          (error, result) => {
            if (error) {
              reject(error);
              console.log(error);
            }
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  async deleteImage(imageUrl: string) {
    const publicId = this.extractPublicIdFromUrl(imageUrl);
    return new Promise((resolve, reject) => {
      v2.uploader.destroy(
        publicId,
        {
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          return resolve(result);
        },
      );
    });
  }

  extractPublicIdFromUrl(url: string) {
    //regular expression to extract the public id from the url
    const regex = /\/v\d+\/(.+)\.(?:jpg|jpeg|jpe|gif|png|bmp|svg|webp)/;

    //extract the public using regular expression
    const matches = url.match(regex);

    if (matches && matches.length > 1) {
      return matches[1];
    } else {
      throw new Error('Invalid Cloudinary url');
    }
  }
}
