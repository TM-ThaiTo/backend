import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, now } from 'mongoose';
import { CreateCommentDto, UpdateCommentDto } from '../dto/index.dto';
import { Comment, CommentDocument } from '@/comment/schema/index';
import { STATUS_MESSAGE } from 'src/constants';
import { UserService } from '@/user/service/user.service';
import { PostService } from '@/post/service/post.service';
import { HandlePostDatabase } from '@/post/handle';
import { HandleUserDatabase } from '@/user/handle/user.db';

@Injectable()
export class CommentAdminService {
    constructor(
        @InjectModel(Comment.name) private readonly commentPostModel: Model<CommentDocument>,

        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly handleUserDatabase: HandleUserDatabase,

        @Inject(forwardRef(() => PostService))
        private readonly postService: PostService,
        private readonly handlePostDatabase: HandlePostDatabase,
    ) { }

    async getAllCommentByIdPost(id: string, page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;
            const comments = await this.commentPostModel.find({ idPost: id }).skip(skip).limit(limit);
            const totalComments = await this.commentPostModel.find({ idPost: id }).countDocuments().exec();
            if (!comments) throw new NotFoundException('No Comment With Post');

            const _query = {
                page: Number(page),
                limit: Number(limit),
                total_page: Math.ceil(totalComments / Number(limit)),
                total: totalComments,
            }
            return { code: 0, message: 'Success', data: { _query, comments } }
        } catch (e) { throw new BadRequestException('error get comment') }
    }

    async searchCommentByIdPost(search: string, idUser: string, idPost: string, idComment: string, page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;
            const query = {};

            if (idComment) {
                const comment = await this.commentPostModel.findById(idComment);
                if (!comment) throw new NotFoundException('No Comment With Post');
                const _query = {
                    page: Number(page),
                    limit: Number(limit),
                    total_page: (1 / Number(limit)),
                    total: 1,
                }
                return { code: 0, message: 'Success', data: { _query, comments: [comment] } }
            }

            if (search) query['content'] = { $regex: search, $options: 'i' };
            if (idUser) query['idUser'] = idUser;
            if (idPost) query['idPost'] = idPost;

            const comments = await this.commentPostModel.find(query).skip(skip).limit(limit);
            const totalComments = await this.commentPostModel.find(query).countDocuments().exec();
            if (!comments) throw new NotFoundException('No Comment With Post');

            const _query = {
                page: Number(page),
                limit: Number(limit),
                total_page: (totalComments / Number(limit)),
                total: comments?.length,
            }
            return { code: 0, message: 'Success', data: { _query, comments } }
        } catch (e) { throw new BadRequestException('error search comment') }
    }

    async deleteCommentWithAdmin(id: string) {
        try {
            const comment = await this.commentPostModel.findById(id);
            if (!comment) throw new NotFoundException('No Comment With Post');
            await this.commentPostModel.findByIdAndDelete(id);
            return { code: 0, message: 'Success' };
        } catch (e) { throw new BadRequestException('error delete comment') }
    }
}