import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '@/post/schemas/index';
import { Model, Types } from 'mongoose';

@Injectable()
export class HandlePostAdminDatabase {
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    ) { }
    async totalPost() { return await this.postModel.countDocuments().exec() }

    async getAllPost(page: number, limit: number) {
        const skip = (page - 1) * limit;
        return await this.postModel.find().skip(skip).limit(limit).exec();
    }

    async searchPost(
        search: string,
        idUser: string,
        slug: string,
        page: number,
        limit: number,
    ) {
        var query = {};

        if (search) query['$text'] = { $search: search };
        if (idUser) query['idUser'] = idUser;
        if (slug) query['slug'] = slug;

        const skip = (page - 1) * limit;
        const totalPostByQuery = await this.postModel.countDocuments(query).exec();
        const posts = await this.postModel.find(query).skip(skip).limit(limit);

        return { total: totalPostByQuery, posts }
    }
}