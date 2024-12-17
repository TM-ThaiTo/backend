import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '@/post/schemas/index';
import { Model, Types } from 'mongoose';

@Injectable()
export class HandlePostDatabase {
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    ) { }

    async getPost(skip: number, limit: number) { return await this.postModel.find().skip(skip).limit(limit).lean(); }
    async findAllOnePost(id: string) { const objectId = new Types.ObjectId(id); return await this.postModel.findOne({ _id: objectId }); }
    async findOnePostById(id: string): Promise<PostDocument> { const objectId = new Types.ObjectId(id); return await this.postModel.findOne({ _id: objectId }).exec(); }
    async findOnePostBySlug(slug: string): Promise<PostDocument> { return await this.postModel.findOne({ slug }).exec(); }
    async totalPost() { return await this.postModel.countDocuments(); }
    async findPostPublic(openPublic: boolean, skip: number, limit: number) { return await this.postModel.find({ status: 1 }).skip(skip).limit(limit).exec(); }
    async findMyPostStatusWithPublic(idUser: string, type: number, status: number, skip: number, limit: number) { return await this.postModel.find({ idUser, status, type }).skip(skip).limit(limit).exec(); }
    async findMyPostAllByIdUser(idUser: string, skip: number, limit: number) { return await this.postModel.find({ idUser: idUser }).skip(skip).limit(limit).exec(); }
    async updateCommentsPost(post: PostDocument) { post.comments += 1; post.save(); return post; }
    async createPost(data: any) { return await this.postModel.create(data); }
    async findAllDataPostBySlug(slug: string) { return await this.postModel.findOne({ slug }).exec(); }

    async findPostVideoWithPublic(page: number, limit: number) {
        return await this.postModel.find({ type: 2, status: 1 }).skip((page - 1) * limit).limit(limit).exec();
    }
    async findPostPublicByIdUser(idUser: string, status: number, page: number, limit: number) {
        return await this.postModel.aggregate([
            { $match: { idUser, status, type: { $ne: 3 } } }, // Lọc bài viết theo điều kiện
            { $sample: { size: limit } }, // Lấy ngẫu nhiên `limit` bài viết
        ]).exec();
    }
    async findMyPostPublic(idUser: string, status: number, skip: number, limit: number) {
        return await this.postModel.find({ idUser, status, type: { $ne: 3 } }).skip(skip).limit(limit).exec();
    }
    async findAllPostByIdUser_NoStatusPostAndPage(idUser: string, page: number, limit: number) {
        return await this.postModel.find({ idUser, type: { $ne: 3 } }).skip((page - 1) * limit).limit(limit).exec();
    }

    async findExplore(page: number, limit: number) {
        return await this.postModel.find({ type: { $ne: 3 } }).skip((page - 1) * limit).limit(limit).exec();
    }
}