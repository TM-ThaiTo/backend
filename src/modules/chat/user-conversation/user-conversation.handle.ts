import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { UserConversation, UserConversationDocument } from './user-conversation.schema';

@Injectable()
export class HandleUserConversationDB {
    constructor(
        @InjectModel(UserConversation.name) private readonly conversationModel: Model<UserConversationDocument>
    ) { }

    async findOneUserConversationByIdUser_IdConversation(idUser: string, idConversation: string) {
        return await this.conversationModel.findOne({ idUser, idConversation }).exec();
    }

    async findUserConversationByIdUser_Status_Type(idUser: string, status: number = 0, type: number = 0) {
        return await this.conversationModel.find({ idUser, status, type }).exec();
    }

    async findUserConversationByIdUser_Type(idUser: string, type: number = 0) {
        return await this.conversationModel.find({ idUser, type }).exec();
    }

    async findUserConversationBy_IdUser_IdConversation_Slug(idUser: string, idConversation: string, slug: string) {
        return await this.conversationModel.findOne({ idUser, idConversation, slug }).exec();
    }

    async findUserConversation_IdUser_Slug(idUser: string, slug: string) {
        return await this.conversationModel.findOne({ idUser, slug }).exec();
    }

    async createUserConversation(data: any) {
        return await this.conversationModel.create(data);
    }

    async searchUserConversation(key: string, slug: string, page: number = 1, limit: number = 5) {
        const query = {};
        if (key) query['$or'] = [{ userName: { $regex: key, $options: 'i' } }];
        if (slug) query['slug'] = slug;
        return await this.conversationModel.find(query).skip((page - 1) * limit).limit(limit).exec();
    }
}