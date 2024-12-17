import { HandleHiddenWordsDatabase } from "@/hidden_words/handle/handle.hiddenWord.db";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Comment, CommentDocument } from "../schema";
import { Model } from "mongoose";

@Injectable()
export class HandleCommentDatabase {
    constructor(
        @InjectModel(Comment.name) private readonly commentPostModel: Model<CommentDocument>,
        private readonly handleHiddenWorksDatabase: HandleHiddenWordsDatabase,
    ) { }

    async findCommentByIdPost(idPost: string, page: number, limit: number) { return await this.commentPostModel.find({ idPost: idPost, idParent: "" }).skip((page - 1) * limit).limit(limit); }
    async findCommentById(id: string) { return await this.commentPostModel.findById(id).exec(); }
    async findById(id: any) { return await this.commentPostModel.findById(id).exec(); }
    async findByQuery(query: any) { return await this.commentPostModel.find(query).sort({ left: 1 }).exec(); }

    async create(dto: any) { return await this.commentPostModel.create(dto); }

    async updateManyRight(parentComment: any) {
        await this.commentPostModel.updateMany(
            { right: { $gte: parentComment.right } },
            { $inc: { right: 2 } }
        );
    }

    async updateManyLeft(parentComment: any) {
        await this.commentPostModel.updateMany(
            { right: { $gte: parentComment.right } },
            { $inc: { left: 2 } }
        );
    }
}