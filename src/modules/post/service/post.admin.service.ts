import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from '@cloudinary/cloudinary.service';
import { UpdatePostDto, CreatePostDto } from '@/post/dto/index.dto';
import { STATUS_MESSAGE } from '@constants/index'
import { v4 as uuidv4 } from 'uuid';
import { PostAuth, HandlePostDatabase } from '@/post/handle';
import { HandleUserDatabase } from '@/user/handle/user.db';
import { HandleLikePostDatabase } from '@/like-post/handle';
import { HandleFollowDatabase } from '@/follows/handle';
import { isAwaitKeyword } from 'typescript';
import { HandlePostAdminDatabase } from '../handle/post.admin.db';

@Injectable()
export class PostAdminService {

    constructor(
        // private readonly postAuth: PostAuth,
        // private readonly handlePostDatabase: HandlePostDatabase,
        // private readonly cloudinaryService: CloudinaryService,
        // private readonly handleUserDatabase: HandleUserDatabase,
        // private readonly handleLikePostDatabase: HandleLikePostDatabase,
        // private readonly handleFollowDatabase: HandleFollowDatabase,
        private readonly handlePostAdminDatabase: HandlePostAdminDatabase,
    ) { }

    async GetAllPostServiceByAdmin(page: number, limit: number) {
        try {
            const posts = await this.handlePostAdminDatabase.getAllPost(page, limit);
            if (!posts) throw new NotFoundException('Post not found');

            const totalPosts = await this.handlePostAdminDatabase.totalPost();

            const _query = {
                page: Number(page),
                limit: Number(limit),
                total: totalPosts,
                total_page: Math.ceil(totalPosts / limit)
            }
            return {
                code: 0,
                message: 'Success',
                data: { _query, posts }
            }
        } catch (e) { throw new BadRequestException('Get All Post error'); }
    }

    async GetSearchPostByAdmin(
        search: string,
        idUser: string,
        slug: string,
        page: number,
        limit: number,
    ) {
        try {
            const { total, posts } = await this.handlePostAdminDatabase.searchPost(search, idUser, slug, page, limit);
            if (!posts) throw new BadRequestException('Posts not found');

            const _query = {
                page,
                limit,
                total,
                total_page: Math.ceil(total / limit)
            }
            return {
                code: 0,
                message: 'Success',
                data: { _query, posts }
            }

        } catch (e) { throw new BadRequestException('Get All Post error'); }
    }
}