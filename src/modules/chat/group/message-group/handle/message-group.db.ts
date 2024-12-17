import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageGroup, MessageGroupDocument } from '../schemas/message-group.schema';

@Injectable()
export class HandleMessageGroupDB {
    constructor(
        @InjectModel(MessageGroup.name) private model: Model<MessageGroupDocument>,
    ) { }

    async createMessageGroup(dto: any) { return await this.model.create(dto); }

    async getMessages(idConversation: string, page: number, limit: number) {
        return await this.model.find({ idConversation }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec();;
    }
}