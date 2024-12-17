import {
  Controller, Get, Post, Body, Patch, Param, UseGuards, Delete, Query,
  UseInterceptors, UploadedFiles, BadRequestException, UseFilters
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { MessageService } from './message.service';
import { NewMessageDto } from './dto';
import { Role } from '@constants/index';
import { RolesGuard, Roles, JwtGuard, GetUser } from 'src/common/index';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { validateId } from '@/utils/validateId';
import { HttpExceptionFilter } from '@/utils/http-exception.filter';

@Controller('/api/v1/message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private eventEmitter: EventEmitter2,
  ) { }

  @Post()
  @UseGuards(JwtGuard)
  @UseFilters(HttpExceptionFilter)
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      storage: new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
          folder: 'media_message',
          resource_type: (req, file) => {
            return file.mimetype.startsWith('video') ? 'video' : 'image';
          },
          public_id: (req, file) => {
            const fileType = file.mimetype.startsWith('video') ? 'video' : 'image';
            return `message_${fileType}-${Date.now()}`;
          },
        } as any,
      }),
      limits: {
        fileSize: 500 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith('image')) {
          if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            return callback(new BadRequestException('Only image files (jpg, jpeg, png, gif) are allowed!'), false);
          }
        } else if (file.mimetype.startsWith('video')) {
          if (file.mimetype !== 'video/mp4') { return callback(new BadRequestException('Only MP4 video files are allowed!'), false); }
        } else { return callback(new BadRequestException('Invalid file type! Only images and MP4 videos are allowed.'), false); }
        callback(null, true);
      },
    }),
  )
  async create(
    @Body() newMessage: NewMessageDto,
    @GetUser() auth: any,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const uploadedMedia = [];
    try {
      if (files && files.length > 0) {
        const promises = files.map(async (file) => {
          const cloudinaryFile = file as any;
          uploadedMedia.push(cloudinaryFile.public_id);

          const req = {
            ...newMessage,
            image: file.mimetype.startsWith('image') ? cloudinaryFile.path || cloudinaryFile.secure_url : undefined,
            video: file.mimetype.startsWith('video') ? cloudinaryFile.path || cloudinaryFile.secure_url : undefined,
          };

          const response = await this.messageService.createMessage(req, auth);
          await this.eventEmitter.emit('message.create', response);
          return response;
        });

        const responses = await Promise.all(promises);
        return responses;
      } else {
        const response = await this.messageService.createMessage(newMessage, auth);
        await this.eventEmitter.emit('message.create', response);
        return response;
      }
    } catch (error) {
      // console.log('Error occurred, rolling back uploaded media:', error);

      if (uploadedMedia.length > 0) {
        await Promise.all(uploadedMedia.map(async (publicId) => { return cloudinary.uploader.destroy(publicId); }));
      }
      // throw new Error('An error occurred while uploading files, all uploaded files have been rolled back.');
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  getMessageByIdConversation(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @GetUser() account: any
  ) {
    validateId(id);
    return this.messageService.getMessageByIdConversation(id, account, page, limit);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.USER)
  async unSendMessage(@Param('id') id: string, @GetUser() account: any) {
    validateId(id);
    const response = await this.messageService.unSendMessage(id, account);
    await this.eventEmitter.emit('message.unsend', response);
    return response;
  }
}
