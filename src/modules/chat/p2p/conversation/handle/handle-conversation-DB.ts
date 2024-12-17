import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateConversationDto } from '@/chat/p2p/conversation/dto';
import { Conversation, ConversationDocument } from '@/chat/p2p/conversation/schemas';
import mongoose, { Model, Types } from 'mongoose';

@Injectable()
export class HandleConversationDB {
    constructor(
        @InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>
    ) { }
    async updateLastMessage(conversationId: string, message: any) { return await this.conversationModel.findByIdAndUpdate(conversationId, { lastMessageAt: message, }); }
    async findOneConversationById(id: string) { const objectId = new Types.ObjectId(id); return await this.conversationModel.findOne({ _id: objectId }); }
    async findOneConversationBySlug(slug: string) { return await this.conversationModel.findOne({ slug: slug }); }
    async updateLastMessageAt(id: string, data: any) { return await this.conversationModel.findByIdAndUpdate(id, { lastMessageAt: data }); }
    async getAllConversations(page: number, limit: number) { return await this.conversationModel.find().skip((page - 1) * limit).limit(limit).exec(); }
    async totalConversations() { return await this.conversationModel.countDocuments(); }
    async createNoNewMessage(data: any) { return await this.conversationModel.create(data); }

    async findOneRoomsConversation_ByIdUserOne_IdUserTwo(idUserOne: string, idUserTwo: string) {
        return await this.conversationModel.findOne({
            $or: [
                { creator: idUserOne, recipient: idUserTwo },
                { creator: idUserTwo, recipient: idUserOne }
            ]
        });
    }
    async create(slug: string, idUserSend: string, idReceive: string, data: any) {
        const newConversation = await this.conversationModel.create({
            creator: idUserSend,
            recipient: idReceive,
            slug: slug,
            status: 'padding',
            lastMessageAt: null,
        });
        const dataLastMessageAt = {
            idConversation: newConversation.id,
            sender: idUserSend,
            receiver: idReceive,
            content: data?.content,
            images: data?.images,
            file: data?.file,
            isRead: false,
        }
        await newConversation.updateOne({ lastMessageAt: dataLastMessageAt })
        return newConversation;
    }
    async findConversationByIdUser(id: string) {
        return await this.conversationModel.find({
            $and: [
                { status: { $ne: 'nomessage' } },
                {
                    $or: [
                        { status: 'active', $or: [{ creator: id }, { recipient: id }] },
                        { status: 'padding', creator: id }
                    ]
                }
            ]
        });
    }
    async findConversationPadding(id: string) {
        return await this.conversationModel.find({
            $or: [
                { status: 'padding', recipient: id }
            ]
        })
    }
    async findConversationByIdUserOneAndIdUserTwo(idOne: string, idTwo: string) {
        return await this.conversationModel.findOne({
            status: { $in: ['active', 'nomessage', 'padding'] },
            $or: [
                { creator: idOne, recipient: idTwo },
                { creator: idTwo, recipient: idOne }
            ]
        });
    }
    async updateIsReadLastMessageAtByIdConversation(id: string) {
        const conversation = await this.findOneConversationById(id);
        if (conversation && conversation.lastMessageAt) {
            await conversation.updateOne({
                $set: {
                    'lastMessageAt.isRead': true
                }
            });
        }
    }
    async searchConversation(id: string, slug: string, creator: string, recipient: string, page: number, limit: number) {
        const query = {};
        if (id) {
            query['_id'] = id;
        }
        if (slug) {
            query['slug'] = slug;
        }
        if (creator) {
            query['creator'] = creator;
        }
        if (recipient) {
            query['recipient'] = recipient;
        }

        const _query = {
            page: Number(page),
            limit: Number(limit),
            total: await this.conversationModel.countDocuments(query),
            total_page: Math.ceil(await this.conversationModel.countDocuments(query) / limit)
        }
        const conversations = await this.conversationModel.find(query).skip((page - 1) * limit).limit(limit);

        return { conversations, _query };
    }
}