import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '@/post/schemas/index';
import { Model, Types } from 'mongoose';
import { HandlePostDatabase } from "./post.db";
import { UserService } from '@/user/service/user.service';
import { HandleUserDatabase } from '@/user/handle/user.db';

@Injectable()
export class PostAuth {
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
        private readonly handlePostDatabase: HandlePostDatabase,

        // @Inject(forwardRef(() => UserService))
        // private readonly handleUserDatabase: UserService,
        private readonly handleUserDatabase: HandleUserDatabase,

    ) { }

    // fn: check auth update post
    async checkAuthUpdatePost(slug: string, userGet: any): Promise<PostDocument> {
        try {
            const post = await this.handlePostDatabase.findAllDataPostBySlug(slug);
            if (!post) throw new NotFoundException("Post Not Found");

            const user = await this.handleUserDatabase.findOneUserById(post?.idUser);
            if (!user) throw new NotFoundException("User not fount");
            if (post?.idUser !== userGet?._id.toString()) throw new UnauthorizedException("Không có quyền chỉnh sửa");

            return post;
        } catch (error) { throw error }
    }

    // fn: check auth update post
    async checkAuthDeletePost(id: string, account: any): Promise<PostDocument> {
        try {
            const post = await this.handlePostDatabase.findOnePostById(id);
            if (!post) throw new NotFoundException("Post Not Found");
            const user = await this.handleUserDatabase.findOneUserById(post?.idUser);
            if (!user) throw new NotFoundException("User not fount");
            if (user?.slug !== account?.userName) throw new UnauthorizedException("Không có quyền chỉnh sửa");
            return post;
        } catch (error) { throw error }
    }
}