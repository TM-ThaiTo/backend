import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { HandleNotificationtDatabase } from './handle/handleNotification.db';
import { HandleUserDatabase } from '@/user/handle/user.db';
import { HandlePostDatabase } from '@/post/handle';
import { CommentService } from '@/comment/service/comment.service';
import { typeNotification } from '@/utils/notification/typeNotifications';

@Injectable()
export class NotificationService {
  constructor(
    private readonly handleNotification: HandleNotificationtDatabase,
    private readonly handleUserDatabase: HandleUserDatabase,
    private readonly handlePostDatabse: HandlePostDatabase,
    private readonly commentService: CommentService,

  ) { }

  async create(dto: any) {
    try {
      const { idUserCreate, type, idUserReceive, idContent } = dto;
      if (idUserCreate === idUserReceive) return;
      const findNotification = await this.handleNotification.findNotificationByIdUserCreate_Type_IdUserReceive_IdContent(idUserCreate, type, idUserReceive, idContent);
      if (findNotification) return;
      return await this.handleNotification.handleCreate(dto);
    } catch (e) { throw e }
  }

  async handleContentNotification(userCreate: any, type: number, idContent: string) {
    switch (type) {
      case 1: { // create post
        return await this.handlePostDatabse.findOnePostById(idContent);
      }
      case 2: { // like post
        return await this.handlePostDatabse.findOnePostById(idContent);
      }
      case 3: { // comment
        const dataComment = await this.commentService.findCommentById(idContent);
        if (!dataComment) return null;
        const dataPostComment = await this.handlePostDatabse.findOnePostById(dataComment?.idPost.toString());
        return {
          comment: dataComment,
          post: dataPostComment,
        }
      }
      case 4: {

      }
      case 5: {

      }

      default: return null;
    }
  }
  async handleAddUserNotification(data: any) {
    try {
      const dataGet = [];
      for (const item of data) {
        const { _id, idContent, idUserCreate, idUserReceive, type, createdAt } = item;
        console.log('check data: ', item);

        const userCreate = await this.handleUserDatabase.findOneUserById(idUserCreate);
        if (!userCreate) continue;
        const dataContent = await this.handleContentNotification(userCreate, type, idContent);

        const data = {
          notification: {
            type: type,
            isRead: item?.isRead === 0 ? false : true,
            id: _id?.toString(),
            time: createdAt,
          },
          user: userCreate,
          dataContent,
        }
        dataGet.push(data);
      }
      return dataGet;
    } catch (e) { throw e }
  }
  async getAllNotification(auth: any, page: number, limit: number) {
    try {
      const { user } = auth;
      const idUser = user?._id.toString();
      const getNotifications = await this.handleNotification.findAllNotifacationWithIdUser_page_limit(idUser, page, limit);
      if (!getNotifications) throw new NotFoundException("Không có thông báo");
      const dataNotifiAndUser = await this.handleAddUserNotification(getNotifications);

      return {
        code: 0,
        data: dataNotifiAndUser,
      }
    } catch (e) { throw e };
  }

  async updateIsRead(id: string, auth: any) {
    try {
      const { user } = auth;
      const find = await this.handleNotification.findNotificationbyId(id);
      if (!find || user?._id?.toString() !== find?.idUserReceive) throw new BadRequestException('notification notfound or not user');

      await find.updateOne({ isRead: 1 });
      return { message: 'Success' }
    } catch (e) { throw e }
  }

  async getNotificationFollow(auth: any, page: number = 1, limit: number = 10) {
    try {
      const { user } = auth;
      const idUserGet = user?._id.toString();
      const findNotificationFollows = await this.handleNotification.findNotificationByTypeFollowAndIdUserAndPageLimit(typeNotification.REQUESTFOLLOW, idUserGet, page, limit);
      if (!findNotificationFollows) throw new NotFoundException("Không có thông báo");
      const dataGet = await this.handleAddUserNotification(findNotificationFollows);
      return {
        data: dataGet,
      }
    } catch (e) { throw e }
  }

  async getNotificationPost(auth: any, page: number = 1, limit: number = 10) {
    try {
      const { user } = auth;
      const idUserGet = user?._id.toString();
      const finds = await this.handleNotification.findNotificationByTypePostAndIdUserAndPageLimit(idUserGet, page, limit);
      if (!finds) throw new NotFoundException("Không có thông báo");
      const dataGet = await this.handleAddUserNotification(finds);
      return {
        data: dataGet,
      }
    } catch (e) { throw e }
  }

  async rejectFollow(auth: any, id: string) {
    try {
      const { user } = auth;
      const idUser = user?._id.toString();
      const findNotification = await this.handleNotification.findNotificationbyId(id);
      if (!findNotification) throw new NotFoundException('Notification Not found');
      if (idUser !== findNotification.idUserReceive) throw new BadRequestException('You not permisstion delete');
      await findNotification.deleteOne();
      return { message: 'ok' };
    } catch (e) { throw e }
  }
}
