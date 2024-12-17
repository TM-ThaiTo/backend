import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema'
import { typeNotification } from "@/utils/notification/typeNotifications";

@Injectable()
export class HandleNotificationtDatabase {
    constructor(
        @InjectModel(Notification.name) private readonly notificationtModel: Model<NotificationDocument>,
    ) { }

    async handleCreate(dto: any) { return await this.notificationtModel.create(dto); }

    async findNotificationByIdUserCreate_Type_IdUserReceive_IdContent(
        idUserCreate: string,
        type: string,
        idUserReceive: string,
        idContent: string
    ) {
        return await this.notificationtModel.findOne({ idUserCreate, type, idUserReceive, idContent }).exec();
    }

    async findAllNotifacationWithIdUser_page_limit(idUserReceive: string, page: number, limit: number) {
        return await this.notificationtModel.find({ idUserReceive }).find({ idUserReceive }).skip((page - 1) * limit).limit(limit).exec();
    }

    async findNotificationbyId(id: string) { return await this.notificationtModel.findById(id).exec(); }

    async findNotificationByTypeFollowAndIdUserAndPageLimit(type: number, idUserReceive: string, page: number, limit: number) {
        return await this.notificationtModel.find({ type, idUserReceive }).skip((page - 1) * limit).limit(limit).exec();
    }

    async findNotificationByTypePostAndIdUserAndPageLimit(idUserReceive: string, page: number, limit: number) {
        const types = [
            typeNotification.CREATEPOST,
            typeNotification.COMMENTPOST,
            typeNotification.LIKEPOST,
            typeNotification.REPLYCOMMENT,
        ];
        return await this.notificationtModel.find({ type: { $in: types }, idUserReceive }).skip((page - 1) * limit).limit(limit).exec();
    }

    async deleteNotification(idUserCreate: string, idUserReceive: string, type: number) {
        return await this.notificationtModel.deleteOne({ idUserCreate, idUserReceive, type })
    }
}