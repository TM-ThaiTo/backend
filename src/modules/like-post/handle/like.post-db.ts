import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LikePost, LikePostDocument } from '@/like-post/schema';
import { LikePostDto } from "@/like-post/dto";

@Injectable()
export class HandleLikePostDatabase {
    constructor(
        @InjectModel(LikePost.name) private readonly likePostModel: Model<LikePostDocument>,
    ) { }

    async findLikePostByIdUserAndIdPost(idUser: string, idPost: string) {
        return await this.likePostModel.findOne({ idUser, idPost }).exec();
    }

    async create(data: LikePostDto) {
        await this.likePostModel.create(data);
    }
}