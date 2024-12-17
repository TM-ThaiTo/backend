import { BadGatewayException, BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateConversationDto } from '@/chat/p2p/conversation/dto';
import { HandleConversationDB } from '@/chat/p2p/conversation/handle'
import { HandleMessageDB } from '@/chat/p2p/message/handle';
import { HandleUserDatabase } from '@/user/handle/user.db';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from "argon2";
import { HandleUserConversationDB } from '@/chat/user-conversation/user-conversation.handle';

@Injectable()
export class ConversationService {
  constructor(
    private readonly handleConversationDb: HandleConversationDB,
    private readonly handleMessageDb: HandleMessageDB,
    private readonly handleUserDb: HandleUserDatabase,
    private readonly handleUserConversationDB: HandleUserConversationDB,
  ) { }

  async checkUser(idCreator: string, idRecipient: string) {
    const creator = await this.handleUserDb.findOneUserById(idCreator);
    if (!creator) throw new NotFoundException("người dùng lập cuộc trò chuyện không tồn tại");
    const recipient = await this.handleUserDb.findOneUserById(idRecipient);
    if (!recipient) throw new NotFoundException("người dùng nhận cuộc trò chuyện không tồn tại");
    if (creator?.id === recipient?.id) throw new BadRequestException("trùng người dùng");
    return { creator, recipient };
  }

  async createConversationNoNewMessage(dto: CreateConversationDto, auth: any) {
    try {
      const { user } = auth
      const idUserCreate = user?._id;
      const { idUser } = dto;
      const { creator, recipient } = await this.checkUser(idUserCreate, idUser);
      const idCreator = creator?.id;
      const idReceiver = recipient?.id
      const checkConversation = await this.handleConversationDb.findOneRoomsConversation_ByIdUserOne_IdUserTwo(idCreator, idReceiver);
      if (checkConversation) return { code: 0, message: 'Đã có cuộc trò chuyện', data: checkConversation };
      const slug = uuidv4();

      const combinedString = `${idCreator}:${idReceiver}:${slug}`;
      const key = await argon2.hash(combinedString);

      const dataNewConversation = { slug, creator: idCreator, recipient: idReceiver, status: 'nomessage', lastMessageAt: null, key, }
      const newConversation = await this.handleConversationDb.createNoNewMessage(dataNewConversation);

      if (newConversation) {
        const newC = newConversation.toObject();
        const { _id, slug } = newC;
        const usersInfo = [
          { idUser: idCreator, displayName: recipient?.fullName, userName: creator?.slug },
          { idUser: idReceiver, displayName: creator?.fullName, userName: recipient?.slug }
        ];
        await Promise.all(
          usersInfo.map(userInfo =>
            this.handleUserConversationDB.createUserConversation({
              idUser: userInfo.idUser,
              idConversation: _id,
              userName: userInfo.userName,
              displayName: userInfo.displayName,
              status: 0,
              type: 0,
              notification: 1,
              pin: 0,
              slug,
              idDelete: '',
            })
          )
        );
      }
      return { code: 0, message: 'Success', data: newConversation };
    } catch (error) { throw error }
  }

  async getConversationByIdUser(auth: any) {
    try {
      const { user } = auth;
      const idUser = user?.id.toString();

      const conversations = await this.handleUserConversationDB.findUserConversationByIdUser_Status_Type(idUser, 2, 0);
      if (!conversations || conversations.length === 0) throw new NotFoundException("Không có cuộc hội thoại nào");

      let data = [];
      for (const item of conversations) {
        const idUser = item?.idUser;

        const room = await this.handleConversationDb.findOneConversationBySlug(item?.slug);
        if (!room) continue;

        const otherUserId = room.creator === idUser ? room.recipient : room.creator;
        const otherUser = await this.handleUserDb.findOneUserById(otherUserId);
        const dataRoom = {
          conversation: room,
          otherUser: {
            ...otherUser.toObject(),
            fullName: item?.displayName,
          },
        }
        data.push(dataRoom);
      }
      return data;
    } catch (error) { throw error; }
  }

  async getConversationPaddingUser(auth: any) {
    const { user } = auth;
    const idUser = user?.id;

    const conversations = await this.handleConversationDb.findConversationPadding(idUser);
    if (!conversations) throw new BadRequestException("Không có tin nhắn chờ");

    const conversationAndUser = await Promise.all(conversations.map(async (room) => {
      const otherUserId = room.creator === idUser ? room.recipient : room.creator;
      const otherUser = await this.handleUserDb.findOneUserById(otherUserId);
      return { conversation: room, otherUser: otherUser };
    }));
    return conversationAndUser;
  }

  async getDetailConversationBySlugConversation(slug: string, auth: any) {
    try {
      const { user } = auth;
      const findConversation = await this.handleConversationDb.findOneConversationBySlug(slug);
      if (!findConversation) throw new NotFoundException("Conversation not found");
      if (user?.id !== findConversation?.recipient && user?.id !== findConversation?.creator) throw new UnauthorizedException("No Access");

      const idReceiver = user?.id === findConversation.creator ? findConversation.recipient : findConversation.creator;
      const findReceiver = await this.handleUserDb.findOneUserById(idReceiver);
      if (!findReceiver) throw new NotFoundException("Receiver not found");

      const idConversation = findConversation?.id.toString();

      const findUserConversation = await this.handleUserConversationDB.findUserConversationBy_IdUser_IdConversation_Slug(user?.id, idConversation, slug);
      if (!findUserConversation) return { user, receiver: findReceiver, conversation: findConversation, };

      return {
        user,
        receiver: {
          ...findReceiver.toObject(),
          fullName: findUserConversation?.displayName,
        },
        conversation: findConversation,
      };

    } catch (error) { throw error }
  }

  async deleteMessageByRoom(id: string, auth: any) {
    try {
      const { user } = auth;
      const idUser = user?._id.toString();

      const conversation = await this.handleConversationDb.findOneConversationById(id);
      if (!conversation) throw new NotFoundException('Conversation not found');

      const { _id, slug } = conversation;
      const findUserConversation = await this.handleUserConversationDB.findUserConversationBy_IdUser_IdConversation_Slug(idUser, _id, slug);

      const { creator, recipient } = conversation;
      if (idUser !== creator && idUser !== recipient) throw new BadRequestException('Bạn không có quyền xoá tin nhắn');
      const getMessageLatest = await this.handleMessageDb.getMessageLatest(id);

      await findUserConversation.updateOne({ idDelete: getMessageLatest?._id.toString(), status: 3 })
      return { message: 'success' }
    } catch (e) { throw e }
  }
}
