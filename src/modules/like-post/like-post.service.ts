import { BadRequestException, Injectable } from '@nestjs/common';
import { HandlePostDatabase } from '@/post/handle';
import { HandleUserDatabase } from '@/user/handle/user.db';
import { HandleLikePostDatabase, HandleLikePostAuth } from '@/like-post/handle';
import { LikePostDto } from '@/like-post/dto';
import { NotificationService } from '@/notification/notification.service';
import { typeNotification } from '../../utils/notification/typeNotifications'
@Injectable()
export class LikePostService {

    constructor(
        private readonly handleLikePostDatabase: HandleLikePostDatabase,
        private readonly handleLikePostAuth: HandleLikePostAuth,
        private readonly notificationService: NotificationService,

        private readonly handlePostDatabase: HandlePostDatabase,
        private readonly handleUserDatabase: HandleUserDatabase,

    ) { }

    async handleAddLikePost(req: LikePostDto) {
        try {
            const { idUser, idPost } = req;
            const { user, post } = await this.handleLikePostAuth.checkUserAndPost(idUser, idPost);
            const checkFind = await this.handleLikePostDatabase.findLikePostByIdUserAndIdPost(idUser, idPost);
            if (checkFind) return new BadRequestException('Bạn đã like bài này rồi');

            await this.handleLikePostDatabase.create(req);
            await post.updateOne({ likes: +post?.likes + 1 })

            const data = {
                idUserCreate: user?._id?.toString(),
                type: typeNotification.LIKEPOST,
                idUserReceive: post?.idUser,
                idContent: post?._id?.toString(),
            }
            // await this.notificationService.create(data);
            this.notificationService.create(data).catch((err) => {
                console.error("Failed to create notification:", err);
            });

            return { code: 0, message: "Success" }
        } catch (error) { throw error }
    }

    async handleDeleteLikePost(req: LikePostDto) {
        try {
            const { user, post } = await this.handleLikePostAuth.checkUserAndPost(req?.idUser, req?.idPost);

            const find = await this.handleLikePostDatabase.findLikePostByIdUserAndIdPost(req?.idUser, req?.idPost);
            if (!find) return { code: 0, message: "Success" }

            await find.deleteOne();
            await post.updateOne({ likes: +post?.likes - 1 })

            return { code: 0, message: "Success" }
        } catch (error) { throw error }
    }
}
