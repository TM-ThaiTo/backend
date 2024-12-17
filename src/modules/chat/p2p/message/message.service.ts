import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { HandleMessageDB } from './handle';
import { HandleConversationDB } from '../conversation/handle';
import { HandleUserDatabase } from '@/user/handle/user.db';
import * as CryptoJS from 'crypto-js';
import { HandleUserConversationDB } from '@/chat/user-conversation/user-conversation.handle';
import { HandleBlockDB } from '@/setting/block/handle/handle.block.db';

@Injectable()
export class MessageService {
  constructor(
    private readonly handleMessageDB: HandleMessageDB,
    private readonly handleConversationDB: HandleConversationDB,
    private readonly handleUserConversationDB: HandleUserConversationDB,
    private readonly handleUserDB: HandleUserDatabase,
    private readonly handleBlockDB: HandleBlockDB,
  ) { }

  async checkUser(sender: string, received: string) {
    const userSender = await this.handleUserDB.findOneUserById(sender);
    if (!userSender) throw new BadRequestException("Người gửi không tồn tại");
    const userReceiver = await this.handleUserDB.findOneUserById(received);
    if (!userReceiver) throw new BadRequestException("Người nhận không tồn tại");
    if (sender === received) throw new BadRequestException("Người nhận là người gửi");
    return { userSender, userReceiver }
  }

  async checkAuthConversation(auth: any, id: string) {
    const { user } = auth;
    const userId = user?._id?.toString();

    const conversation = await this.handleConversationDB.findOneConversationById(id);
    if (!conversation) throw new BadRequestException("Không có đoạn hội thoại");
    if (conversation?.creator !== userId && conversation?.recipient !== userId) throw new UnauthorizedException("Không có quyền truy cập đoạn chat");

    const conversationId = conversation?._id?.toString();
    const userConversation = await this.handleUserConversationDB.findOneUserConversationByIdUser_IdConversation(userId, conversationId);

    let idMessageGet = '';
    if (userConversation && userConversation?.idDelete !== '') idMessageGet = userConversation?.idDelete;

    return { conversation, idMessageGet };
  }

  async checkUserUnSendMessage(id: string, auth: any) {
    const { user } = auth;
    const message = await this.handleMessageDB.findOneMessageById(id);
    if (!message) throw new NotFoundException("Message not found");
    if (message?.sender !== user?.id) throw new UnauthorizedException("Không có quyền xóa tin nhắn");
    if (message?.type === -1) throw new BadRequestException("Tin nhắn đã bị xóa");
    return message;
  }

  async createMessage(newMessage: any, auth: any) {
    try {
      const { user } = auth;
      const { receiver, idConversation, content, file, image, video } = newMessage;

      const sender = user?.id;
      const checkBlock = await this.handleBlockDB.checkBlock(receiver, sender);
      if (checkBlock) throw new BadRequestException('Không thể gửi tin nhắn');

      const typeMessage = file ? 2 : image ? 1 : video ? 3 : 0;
      const { userSender, userReceiver } = await this.checkUser(sender, receiver);

      const conversation = await this.handleConversationDB.findConversationByIdUserOneAndIdUserTwo(sender, receiver);
      if (!conversation) throw new BadRequestException("Conversation not found")

      var contentMessage: string = '';

      if (!content && image) contentMessage = "Đã gửi ảnh";
      else if (!content && video) contentMessage = "Đã gửi video";
      else {
        const encryptData = (content: string): string => {
          return CryptoJS.AES.encrypt(content, conversation?.key).toString();
        };
        contentMessage = encryptData(content);
      }

      const url = image ? image : video ? video : null;

      const data = {
        sender,
        receiver,
        idConversation,
        content: contentMessage,
        url: url,
        file: null,
        isRead: false,
        type: typeMessage
      };

      const createdMessage = await this.handleMessageDB.create(data);
      await this.handleConversationDB.updateLastMessage(idConversation, createdMessage);

      if (conversation?.status === 'nomessage' && conversation?.creator === sender) {
        const idConversation = conversation?.id.toString();
        const userSender = await this.handleUserConversationDB.findOneUserConversationByIdUser_IdConversation(sender, idConversation);
        const userReceiver = await this.handleUserConversationDB.findOneUserConversationByIdUser_IdConversation(receiver, idConversation);
        await userSender.updateOne({ status: 2 });
        await userReceiver.updateOne({ status: 1 });
        await conversation.updateOne({ status: 'padding' })
      }
      const updateStatus = await this.handleMessageDB.checkSenderAndReceiver(idConversation, sender, receiver);
      if (updateStatus) {
        const idConversation = conversation?.id.toString();
        const userSender = await this.handleUserConversationDB.findOneUserConversationByIdUser_IdConversation(sender, idConversation);
        await userSender.updateOne({ status: 2 });
        await conversation.updateOne({ status: 'active' })
      }

      return { message: createdMessage, userSender, userReceiver }
    } catch (error) { throw error }
  }

  async getMessageByIdConversation(id: string, auth: any, page: number, limit: number) {
    try {
      const { user } = auth;
      const { conversation, idMessageGet } = await this.checkAuthConversation(auth, id);
      const idConversation = conversation?.id;

      let totalMessages = [];
      if (idMessageGet) totalMessages = await this.handleMessageDB.findMessageByIdConversationAndIdMessage(idConversation, idMessageGet);
      else totalMessages = await this.handleMessageDB.findMessageByIdConversation(idConversation);

      const skip = (page - 1) * limit;

      let messages = [];
      if (idMessageGet) messages = await this.handleMessageDB.findMessagesFromIdPaginated(idConversation, idMessageGet, skip, limit);
      else messages = await this.handleMessageDB.findMessageByIdConversationPaginated(idConversation, skip, limit);

      await Promise.all([
        this.handleMessageDB.updateIsReadByIdConversation(idConversation, user?.id),
        this.handleConversationDB.updateIsReadLastMessageAtByIdConversation(idConversation)
      ]);

      const messagesAndUser = await Promise.all(messages.map(async (message) => {
        const messageCopy = message.toObject();
        if (message?.type === -1) { messageCopy.content = "Tin nhắn đã bị xóa"; messageCopy.url = null; messageCopy.file = null; }

        const [userReceiver, userSender] = await Promise.all([
          this.handleUserDB.findOneUserById(message.receiver),
          this.handleUserDB.findOneUserById(message.sender)
        ]);

        return {
          message: messageCopy,
          userReceiver,
          userSender,
          date: messageCopy?.createdAt
        };
      }));

      return {
        code: 0,
        message: 'Success',
        data: messagesAndUser,
        count: messagesAndUser?.length,
        page: Number(page),
        total: totalMessages?.length,
        totalPage: Math.ceil(totalMessages?.length / limit),
      };
    } catch (error) { throw error }
  }

  async unSendMessage(id: string, auth: any) {
    try {
      await this.checkUserUnSendMessage(id, auth);
      const messageUnsend = await this.handleMessageDB.unSendMessage(id);

      const userSender = await this.handleUserDB.findOneUserById(messageUnsend?.sender);
      const userReceiver = await this.handleUserDB.findOneUserById(messageUnsend?.receiver);

      await this.handleConversationDB.updateLastMessage(messageUnsend?.idConversation, messageUnsend);

      return {
        message: messageUnsend,
        userSender,
        userReceiver,
      };
    } catch (error) { throw error }
  }
}
