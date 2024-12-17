import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { RolesGuard, Roles, GetUser, JwtGuard } from 'src/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';

import { Role } from '@constants/index';
import { PostService } from '@/post/service/post.service';
import { CreatePostDto, UpdatePostDto, CreatePostVideoDto } from '@/post/dto/index.dto';
import { CloudinaryService } from '@cloudinary/cloudinary.service';
import Routes from '@/utils/constants/endpoint';
import { PostAdminService } from '../service/post.admin.service'

@Controller(`${Routes.POST}`)
export class PostAdminController {
    constructor(
        private readonly postAdminService: PostAdminService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @Get('/admin/all')
    async GetAllPostByAdmin(
        @Query('page') page: number,
        @Query('limit') limit: number,
    ) {
        return await this.postAdminService.GetAllPostServiceByAdmin(page, limit);
    }

    @Get('/admin/search')
    async GetSearchPostByAdmin(
        @Query('search') search: string,
        @Query('idUser') idUser: string,
        @Query('slug') slug: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
    ) {
        return await this.postAdminService.GetSearchPostByAdmin(search, idUser, slug, page, limit);
    }
}