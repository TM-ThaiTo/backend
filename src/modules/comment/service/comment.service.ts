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
import { HandleHiddenWordsDatabase } from '@/hidden_words/handle/handle.hiddenWord.db';
import { HandleComment } from '../handle/comment';
import { HandleCommentDatabase } from '../handle/comment.db';

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name) private readonly commentPostModel: Model<CommentDocument>,

        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly handleUserDatabase: HandleUserDatabase,

        @Inject(forwardRef(() => PostService))
        private readonly postService: PostService,
        private readonly handlePostDatabase: HandlePostDatabase,

        private readonly handleHiddenWorksDatabase: HandleHiddenWordsDatabase,
        private readonly handleComment: HandleComment,
        private readonly handleCommentDB: HandleCommentDatabase
    ) { }

    async updateReplayCommentParent(id: string) {
        try {
            const comment = await this.commentPostModel.findById(id);
            comment.reply += 1;
            await comment.save();
            return comment.reply;
        } catch (error) { throw error }
    }
    async findCommentByIdPost(idPost: string, page: number, limit: number) { return await this.commentPostModel.find({ idPost: idPost, idParent: "" }).skip((page - 1) * limit).limit(limit); }
    async findCommentById(id: string) {

        return await this.commentPostModel.findById(id).exec();
        // const dataPostComment = await this.handlePostDatabase.findOnePostById(comment?.idPost.toString());
        // return dataPostComment;
    }





    // fn: add new comment
    // nếu không có idParent thì tạo mới comment
    async createCommentService(req: CreateCommentDto) {
        try {
            const user = await this.handleUserDatabase.findOneUserById(req?.idUser);
            if (!user) { throw new NotFoundException(STATUS_MESSAGE.USER_MESSAGE.ERROR.USER_NOT_FOUND) };

            const post = await this.handlePostDatabase.findOnePostById(req.idPost);
            if (!post) { throw new NotFoundException(STATUS_MESSAGE.POST_MESSAGE.ERROR.POST_NOT_FOUND) };

            if (!post.openComment) { throw new BadRequestException(STATUS_MESSAGE.POST_MESSAGE.ERROR.POST_NOT_OPEN_COMMENT) }
            await this.handleComment.checkHiddenComment(post?.idUser, req?.content);

            if (!req.idParent || req.idParent === null || req?.idParent === "") {
                const newComment = await this.commentPostModel.create(req);
                await this.handlePostDatabase.updateCommentsPost(post);
                const user = await this.handleUserDatabase.findOneUserById(newComment?.idUser.toString());
                const commentAndUser = {
                    _id: newComment._id,
                    idUser: newComment.idUser,
                    idPost: newComment.idPost,
                    content: newComment.content,
                    reply: newComment.reply,
                    like: newComment.like,
                    createdAt: now(),
                    user: user ? user.toObject() : null,
                };
                return commentAndUser;
            } else { // reply
                const newComment = await this.createCommentAndUpdateAllCommentChild(req.idParent, req);
                await this.handlePostDatabase.updateCommentsPost(post);
                const countReply = await this.handleComment.updateReplayCommentParent(req.idParent);
                const user = await this.handleUserDatabase.findOneUserById(newComment?.idUser.toString());
                const commentAndUser = {
                    _id: newComment._id,
                    idUser: newComment.idUser,
                    idPost: newComment.idPost,
                    content: newComment.content,
                    reply: newComment.reply,
                    like: newComment.like,
                    createdAt: now(),
                    user: user ? user.toObject() : null,
                };
                return { count: countReply, data: commentAndUser };
            }
        } catch (error) { throw error };
    }

    // fn: create comment child and update all comment child
    async createCommentAndUpdateAllCommentChild(idParent: string, req: CreateCommentDto) {
        try {
            const parentComment = await this.commentPostModel.findById(idParent);
            if (!parentComment) { throw new NotFoundException(STATUS_MESSAGE.COMMENT_MESSAGE.ERROR.PARENT_COMMENT_NOT_FOUND); };

            await this.commentPostModel.updateMany(
                { right: { $gte: parentComment.right } },
                { $inc: { right: 2 } }
            );

            await this.commentPostModel.updateMany(
                { left: { $gt: parentComment.right } },
                { $inc: { left: 2 } }
            );

            const newComment = await this.commentPostModel.create({
                idPost: req.idPost,
                idUser: req.idUser,
                idParent: idParent,
                left: parentComment.right,
                right: parentComment.right + 1,
                content: req.content,
                reply: 0,
                like: 0,
                reports: 0,
                isDeleted: false,
                isHide: false,
            });
            return newComment;
        } catch (error) { throw error }
    }

    // fn: get comments child
    async getCommentsChild(commentId: string) {
        try {
            const parentComment = await this.commentPostModel.findById(commentId);
            if (!parentComment) { throw new NotFoundException(STATUS_MESSAGE.COMMENT_MESSAGE.ERROR.COMMENT_NOT_FOUND); }

            // Lấy tất cả các comment con bằng cách sử dụng giá trị left và right của comment cha
            const childComments = await this.commentPostModel.find({
                idParent: commentId,
                left: { $gt: parentComment.left },
                right: { $lt: parentComment.right }
            }).sort({ left: 1 }).exec();

            const total = childComments.length;

            const commentAndUser = await Promise.all(childComments.map(async (comment) => {
                const user = await this.handleUserDatabase.findOneUserById(comment?.idUser.toString());
                return {
                    ...comment.toObject(),
                    user: user ? user.toObject() : null,
                };
            }));

            return { code: 0, message: "Success", data: commentAndUser, count: total };
        } catch (error) { throw error; }
    }

    // fn: delete comment
    async deleteComment(id: string) {
        try {
            const comment = await this.commentPostModel.findById(id);
            if (!comment) throw new NotFoundException(STATUS_MESSAGE.COMMENT_MESSAGE.ERROR.COMMENT_NOT_FOUND);

            const width = comment.right - comment.left + 1;
            // Xoá bình luận và tất cả các bình luận con của nó
            await this.commentPostModel.deleteMany({
                left: { $gte: comment.left },
                right: { $lte: comment.right }
            });
            // Cập nhật lại các giá trị left và right của các bình luận còn lại
            await this.commentPostModel.updateMany(
                { right: { $gt: comment.right } },
                { $inc: { right: -width } }
            );
            await this.commentPostModel.updateMany(
                { left: { $gt: comment.left } },
                { $inc: { left: -width } }
            );

            // Giảm số lượng bình luận của bài viết
            const idPostString: string = comment.idPost.toString();
            const post = await this.handlePostDatabase.findOnePostById(idPostString);
            if (post) {
                post.comments -= width / 2; // Mỗi cặp left-right là một bình luận
                await post.save();
            }
            // Giảm số lượng reply của bình luận cha nếu có
            if (comment.idParent) {
                const parentComment = await this.commentPostModel.findById(comment.idParent);
                if (parentComment) {
                    parentComment.reply -= 1;
                    await parentComment.save();
                }
            }
            return STATUS_MESSAGE.SUCCESS
        } catch (error) { throw error; }
    }

    // fn: update comment
    async updateComment(req: UpdateCommentDto) {
        try {
            const { idComment, content } = req;
            if (!req) { throw new BadRequestException() }

            const comment = await this.commentPostModel.findById(idComment);
            if (!comment) { throw new NotFoundException(STATUS_MESSAGE.COMMENT_MESSAGE.ERROR.COMMENT_NOT_FOUND) };
            if (!content || content === null) { throw new BadRequestException(STATUS_MESSAGE.COMMENT_MESSAGE.ERROR.MISSING_CONTENT_COMMENT) }

            comment.content = content;
            await comment.save();

            return STATUS_MESSAGE.SUCCESS
        } catch (error) { throw error }
    }

    // fn: get comments for a post
    async handleGetComments(slug: string, page: number, limit: number, auth: any) {
        try {
            const post = await this.handlePostDatabase.findAllDataPostBySlug(slug);
            if (!post) { throw new NotFoundException(STATUS_MESSAGE.POST_MESSAGE.ERROR.POST_NOT_FOUND); }
            if (post?.openComment === 0) return { code: 1, message: "No public comment", data: [] };

            const comments = await this.handleCommentDB.findCommentByIdPost(post?.id.toString(), page, limit);
            if (!comments) { throw new NotFoundException(STATUS_MESSAGE.COMMENT_MESSAGE.ERROR.COMMENT_NOT_FOUND) }

            const commentAndUser = await Promise.all(comments.map(async (comment) => {
                const user = await this.handleUserDatabase.findOneUserById(comment?.idUser.toString());
                return {
                    ...comment.toObject(),
                    user: user ? user.toObject() : null,
                };
            }));

            return { code: 0, message: "Success", data: commentAndUser };
        } catch (error) { throw error; }
    }

    // fn: get comments public (no login)
    async handleGetCommentsPublic(slug: string, page: number, limit: number) {
        try {
            const post = await this.handlePostDatabase.findOnePostBySlug(slug);
            if (!post) { throw new NotFoundException(STATUS_MESSAGE.POST_MESSAGE.ERROR.POST_NOT_FOUND); }

            if (!post?.openComment) return { code: 1, message: "No public comment", data: [] };

            const comments = await this.handleCommentDB.findCommentByIdPost(post?.id.toString(), page, limit);
            if (!comments) { throw new NotFoundException(STATUS_MESSAGE.COMMENT_MESSAGE.ERROR.COMMENT_NOT_FOUND) }

            const commentAndUser = await Promise.all(comments.map(async (comment) => {
                const user = await this.handleUserDatabase.findOneUserById(comment?.idUser.toString());
                return {
                    ...comment.toObject(),
                    user: user ? user.toObject() : null,
                };
            }));

            return { code: 0, message: "Success", data: commentAndUser };
        } catch (error) { throw error; }
    }
}