import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageGroupDto } from './dto/create-message-group.dto';
import { UpdateMessageGroupDto } from './dto/update-message-group.dto';
import { HandleMessageGroupDB } from './handle/message-group.db';
import { HandleConversationGroupDB } from '../conversation-group/handle/conversation-group.db';
import * as CryptoJS from 'crypto-js';
import { HandleUserDatabase } from '@/user/handle/user.db';

@Injectable()
export class MessageGroupService {

  constructor(
    private readonly handleMessageGroupDB: HandleMessageGroupDB,
    private readonly handleConversationGroupDB: HandleConversationGroupDB,
    private readonly handleUserDB: HandleUserDatabase,
  ) { }

  async checkUser(idUser: string, idConversation: string) {
    const conversation = await this.handleConversationGroupDB.findConversationGroupById(idConversation);
    if (!conversation) throw new BadRequestException("Không tìm thấy cuộc trò chuyện");
    if (!conversation.members.includes(idUser)) throw Error('User not in conversation');
    return conversation;
  }

  async create(dto: any, auth: any) {
    try {
      const { user } = auth;
      const { idConversation, content, file, image, video } = dto;
      const conversation = await this.checkUser(user?.id, idConversation);

      const sender = user?.id;
      const type = file ? 2 : image ? 1 : video ? 3 : 0;

      let contentMessage = '';
      if (!content && image) contentMessage = "Đã gửi ảnh";
      else if (!content && video) contentMessage = "Đã gửi video";
      else {
        const encryptData = (content: string): string => {
          return CryptoJS.AES.encrypt(content, conversation?.key).toString();
        };
        contentMessage = encryptData(content);
      }

      const newMessage = { sender, idConversation, content: contentMessage, file, type, url: image || video };
      const message = await this.handleMessageGroupDB.createMessageGroup(newMessage);
      await this.handleConversationGroupDB.updateLastMessage(idConversation, message);

      const data = {
        user,
        message,
      }
      return data;
    } catch (e) { console.log('-> erorr create message group', e); throw e; }
  }

  async getMessages(idConversation: string, page: number, limit: number) {
    try {
      const messages = await this.handleMessageGroupDB.getMessages(idConversation, page, limit);
      if (!messages) throw new NotFoundException("Không tìm thấy tin nhắn");

      let messagesAndUser = [];
      for (const item of messages) {
        const user = await this.handleUserDB.findOneUserById(item.sender);
        const data = {
          user,
          message: item.toObject(),
        }
        messagesAndUser.push(data);
      }

      return {
        messages: messagesAndUser,
        page: Number(page),
        limit: Number(limit),
        totalPage: Math.ceil(messages.length / limit),
      };
    } catch (e) { console.log('-> erorr get message group', e); throw e; }
  }
}
