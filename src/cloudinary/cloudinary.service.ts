
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-setting';
import { extractPublicId } from 'cloudinary-build-url';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { FilesInterceptor } from '@nestjs/platform-express';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {

    // fn: Update Image
    // input: file image, type, userId
    uploadFilePost(file: Express.Multer.File, resourceType: 'image' | 'video', userId: string): Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            const folderPath = `posts/${userId}`; // Use userId in the folder path
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: resourceType,
                    folder: folderPath
                },
                (error, result: UploadApiResponse | UploadApiErrorResponse) => {
                    if (error) { return reject(new Error(`Cloudinary upload error: ${error.message}`)); }
                    resolve(result);
                },
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    uploadBase64(base64Image: string, resourceType: 'image' | 'video', userId: string): Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            const folderPath = `posts/${userId}`; // Use userId in the folder path
            cloudinary.uploader.upload(
                base64Image,
                {
                    resource_type: resourceType,
                    folder: folderPath,
                    use_filename: true, // Optional: to use a generated filename
                    unique_filename: true // Optional: to ensure a unique filename
                },
                (error, result: UploadApiResponse | UploadApiErrorResponse) => {
                    if (error) { return reject(new Error(`Cloudinary upload error: ${error.message}`)); }
                    resolve(result);
                },
            );
        });
    }

    // fn: delete Image
    // input: url image
    deleteImage(url: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const publicId = extractPublicId(url);
            cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) { return reject(new Error(`Cloudinary delete error: ${error.message}`)); }
                if (result.result !== 'ok') { return reject(new Error(`Failed to delete file: ${result.result}`)); }
                resolve();
            });
        });
    }

    uploadVideoCrop(
        file: Express.Multer.File,
        userId: string,
        width: number = 1920, // Giá trị mặc định cho width
        height: number = 1080, // Giá trị mặc định cho height
        timeStart: number = 0, // Giá trị mặc định cho thời gian bắt đầu
        timeEnd: number = 10, // Giá trị mặc định cho thời gian kết thúc
        soundOn: boolean = true,
    ): Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            const folderPath = `videos/${userId}`;

            // Khởi tạo transformation cho crop và thời gian
            const transformationOptions = [
                { width: width, height: height, crop: 'crop' }, // Cắt kích thước video nếu cần
                { quality: 'auto' }, // Thiết lập chất lượng tự động
                { start_offset: timeStart, end_offset: timeEnd }, // Trim video
            ];

            const uploadOptions: any = {
                resource_type: 'video',
                folder: folderPath,
                use_filename: true, // Sử dụng tên tệp gốc
                unique_filename: true, // Đảm bảo tên tệp là duy nhất
                // transformation: transformationOptions, // Áp dụng các biến đổi đã chuẩn bị
                eager: transformationOptions, // Sử dụng eager transformation
                eager_async: true, // Xử lý bất đồng bộ
            };

            // Nếu `soundOn` là false, loại bỏ âm thanh
            if (!soundOn) {
                uploadOptions.audio_codec = 'none'; // Loại bỏ âm thanh ở cấp độ video upload
            }

            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result: UploadApiResponse | UploadApiErrorResponse) => {
                    if (error) {
                        return reject(new Error(`Cloudinary upload error: ${error.message}`));
                    }
                    resolve(result); // Trả về kết quả từ Cloudinary
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream); // Chuyển đổi buffer thành stream và upload
        });
    }

    uploadImage(file: Express.Multer.File): Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    use_filename: true,
                    unique_filename: true,
                },
                (error, result: UploadApiResponse | UploadApiErrorResponse) => {
                    if (error) {
                        return reject(new Error(`Cloudinary upload error: ${error.message}`));
                    }
                    resolve(result);
                },
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }
}