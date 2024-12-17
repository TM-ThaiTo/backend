import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from '@/chat/p2p/message/schemas';
import { HandleConversationDB } from '@/chat/p2p/conversation/handle';
import { CreateConversationDto } from '@/chat/p2p/conversation/dto';

@Injectable()
export class HandleMessageDB {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
        private conversationService: HandleConversationDB
    ) { }

    async createNewConversation(idSender: string, idReceiver: string, idConversation: string, data: any) {
        const dataLastMessageAt = {
            idConversation: idConversation,
            sender: idSender,
            receiver: idReceiver,
            content: data?.content,
            images: data?.images,
            file: data?.file,
            isRead: false,
        }
        return await this.messageModel.create(dataLastMessageAt);
    }

    async create(data: any) { return await this.messageModel.create(data); }

    async findMessageByIdConversation(idConversation: string) { return await this.messageModel.find({ idConversation }); }
    async findMessageByIdConversationAndIdMessage(idConversation: string, idMessageGet: string) {
        return await this.messageModel
            .find({
                idConversation,
                _id: { $gt: idMessageGet }, // Lọc các tin nhắn có `_id` lớn hơn `idMessageGet`
            })
            .sort({ createdAt: 1 }) // Sắp xếp theo thời gian tăng dần
            .exec(); // Thực thi truy vấn
    }
    async findMessagesFromIdPaginated(
        conversationId: string,
        idMessageGet: string,
        skip: number,
        limit: number
    ) {
        return await this.messageModel
            .find({
                idConversation: conversationId,
                _id: { $gt: idMessageGet }, // Lấy các tin nhắn có `_id` lớn hơn `idMessageGet`
            })
            .sort({ createdAt: 1 }) // Sắp xếp theo thời gian tăng dần
            .skip(skip) // Bỏ qua một số lượng tin nhắn
            .limit(limit) // Giới hạn số lượng tin nhắn trả về
            .exec(); // Thực thi truy vấn
    }
    async findMessageByIdConversationPaginated(conversationId: string, skip: number, limit: number) { return await this.messageModel.find({ idConversation: conversationId }).sort({ createdAt: -1 }).skip(skip).limit(limit); }

    async findMessageBySlugConversation(slug: string) { return await this.messageModel.find({ slug: slug }); }
    async findAllMessagesByConversationId(conversationId: string) { return await this.messageModel.find({ idConversation: conversationId }); }
    async unSendMessage(id: string) { return await this.messageModel.findByIdAndUpdate(id, { type: -1 }, { new: true }); }
    async findOneMessageById(id: string) { return await this.messageModel.findById(id); }
    async deleteOneMessageById(id: string) { return await this.messageModel.findByIdAndDelete(id); }
    async updateIsReadByIdConversation(id: string, idUserGet: string) { return await this.messageModel.updateMany({ idConversation: id, receiver: idUserGet }, { $set: { isRead: true } }); }

    async checkSenderAndReceiver(idConversation: string, idSender: string, idReceiver: string) {
        const senderMessage = await this.messageModel.exists({ idConversation, sender: idSender });
        const receiverMessage = await this.messageModel.exists({ idConversation, sender: idReceiver });
        return !!(senderMessage && receiverMessage);
    }

    async getMessageLatest(idConversation: string) { return await this.messageModel.findOne({ idConversation }).sort({ createdAt: -1 }).exec(); }
}