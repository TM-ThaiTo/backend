import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { ConversationGroup, ConversationGroupDocument } from '../schemas/conversation-group.schema';
import { validateObjectId } from '@/utils/validateId';

@Injectable()
export class HandleConversationGroupDB {
    constructor(
        @InjectModel(ConversationGroup.name) private readonly conversationGroupModel: Model<ConversationGroupDocument>
    ) { }

    async create(dto: any) { return await this.conversationGroupModel.create(dto) }
    async findConversationGroupBySlug(slug: string) { return await this.conversationGroupModel.findOne({ slug }).exec() }
    async findConversationGroupById(id: string) { const ObjectId = validateObjectId(id); return await this.conversationGroupModel.findOne({ _id: ObjectId }).exec() }
    async updateConversationGroupBySlug(slug: string, members: any) {
        const newMembersCount = members.length;

        return await this.conversationGroupModel.findOneAndUpdate({ slug },
            {
                $push: { members: { $each: members } },
                $inc: { totalMember: newMembersCount },
            },
            { new: true }).exec();
    }
    async updateRemoveMember(slug: string, idMember: string) {
        return await this.conversationGroupModel.findOneAndUpdate({ slug },
            {
                $pull: { members: idMember },
                $inc: { totalMember: -1 },
            },
            { new: true }).exec();
    }
    async updateLastMessage(slug: string, lastMessageAt: any) { return await this.conversationGroupModel.findOneAndUpdate({ slug }, { lastMessageAt }, { new: true }).exec(); }
}