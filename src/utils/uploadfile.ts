import { Injectable } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FileUploadService {

    createFileImages(folderName: string, quantity: number) {
        return FilesInterceptor('files', quantity, {
            storage: new CloudinaryStorage({
                cloudinary: cloudinary,
                params: {
                    folder: folderName,
                    public_id: (req, file) => `message_image-${Date.now()}`,
                } as any,
            }),
            limits: {
                fileSize: 5 * 1024 * 1024,
            },
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                    return callback(new Error('Only image files are allowed!'), false);
                }
                callback(null, true);
            },
        });
    }

    createFileVideo(folderName: string, quantity: number) {
        return FilesInterceptor('files', 1, {
            storage: new CloudinaryStorage({
                cloudinary: cloudinary,
                params: {
                    folder: folderName,
                    resource_type: 'video',
                    public_id: (req, file) => `video-${Date.now()}`,
                } as any,
            }),
            limits: {
                fileSize: 5 * 1024 * 1024,
            },
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.match(/\/(mp4|avi|mov|mkv)$/)) {
                    return callback(new Error('Only video files are allowed!'), false);
                }
                callback(null, true);
            },
        });
    }
}
