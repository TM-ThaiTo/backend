import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { Follow, FollowDocument } from '@/follows/schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class HandleFollowDatabase {
    constructor(
        @InjectModel(Follow.name) private readonly followModel: Model<FollowDocument>,
    ) { }

    async findOneFollowByIdAndIdFollow(id: string, idFollow: string) {
        return await this.followModel.findOne({ idUser: id, idFollow: idFollow }).exec();
    }

    async create(data: any) {
        return await this.followModel.create(data);
    }

    async findFollowByIdFollow(id: string, skip: number, limit: number) {
        return await this.followModel.find({ idFollow: id }).skip(skip).limit(limit);
    }

    async findFollowById(id: string, skip: number, limit: number) {
        return await this.followModel.find({ idUser: id }).skip(skip).limit(limit);
    }

    async findAllFollowById(id: string) {
        return await this.followModel.find({ idUser: id })
    }

    async findAllFollowerByIdUser(id: string) {
        return await this.followModel.find({ idFollow: id });
    }

    async countDocumentIdFollow(id: string) {
        return await this.followModel.countDocuments({ idFollow: id });
    }
    async countDocumentIdUser(id: string) {
        return await this.followModel.countDocuments({ idUser: id });
    }
}