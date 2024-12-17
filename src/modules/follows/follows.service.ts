import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FollowDto } from '@/follows/dto';
import { HandleUserDatabase } from '@/user/handle/user.db';
import { HandleFollowAuth, HandleFollowDatabase } from '@/follows/handle';
import { typeNotification } from '@/utils/notification/typeNotifications';
import { NotificationService } from '@/notification/notification.service';
import { HandleNotificationtDatabase } from '@/notification/handle/handleNotification.db';

@Injectable()
export class FollowsService {
    constructor(
        private readonly handleFollowDatabase: HandleFollowDatabase,
        private readonly handleFollowAuth: HandleFollowAuth,
        private readonly handleUserDatabase: HandleUserDatabase,
        private readonly handleNotificationService: NotificationService,
        private readonly handleNotificationDatabase: HandleNotificationtDatabase,
    ) { }

    async handleAddFollow(req: FollowDto) {
        const { id, idFollow } = req;
        try {
            const { user, userFollow } = await this.handleFollowAuth.checkUser(id, idFollow);

            let request = 0;
            if (userFollow?.privateAccount === 1) {
                const data = {
                    idUserCreate: user?._id?.toString(),
                    type: typeNotification.REQUESTFOLLOW,
                    idUserReceive: userFollow?._id?.toString(),
                    idContent: user?._id?.toString(),
                    isRead: 0,
                }
                await this.handleNotificationService.create(data);
                const find = await this.handleFollowDatabase.findOneFollowByIdAndIdFollow(id, idFollow);
                if (find) throw new BadRequestException({ code: 0, message: 'Bạn đã follow người này rồi' });
                const dataC = { idUser: id, idFollow, request: 1 }

                await this.handleFollowDatabase.create(dataC);
                await userFollow.updateOne({ following: +userFollow?.following + 1 });
                return { code: 0, message: 'Success' }
            }

            const find = await this.handleFollowDatabase.findOneFollowByIdAndIdFollow(id, idFollow);
            if (find) throw new BadRequestException({ code: 0, message: 'Bạn đã follow người này rồi' });

            const data = { idUser: id, idFollow, request }
            await this.handleFollowDatabase.create(data);
            await user.updateOne({ following: +user?.following + 1 });
            await userFollow.updateOne({ follower: +userFollow?.follower + 1 });

            return { code: 0, message: 'Success' }
        } catch (error) { throw error }
    }

    async handleUnFollow(req: FollowDto) {
        try {
            const { id, idFollow } = req;
            const { user, userFollow } = await this.handleFollowAuth.checkUser(id, idFollow);

            const find = await this.handleFollowDatabase.findOneFollowByIdAndIdFollow(id, idFollow);
            if (!find) return { code: 0, message: 'Success' };

            if (find?.request === 1) {
                await find.deleteOne();
                await userFollow.updateOne({ following: +userFollow?.following - 1 });
                return { code: 0, message: 'Success' }
            }

            await find.deleteOne();
            await user.updateOne({ following: +user?.following !== 0 ? +user?.following - 1 : 0 });
            await userFollow.updateOne({ follower: +userFollow?.follower !== 0 ? +userFollow?.follower - 1 : 0 });
            return { code: 0, message: 'Success' }
        } catch (error) { throw error }
    }

    async handleGetFollower(id: string, page: number = 1, limit: number = 10) {
        try {
            if (!id) throw new BadRequestException({ code: 0, message: 'Missing value' });
            const skip = (page - 1) * limit;

            const followers = await this.handleFollowDatabase.findFollowByIdFollow(id, skip, limit);
            if (!followers || followers.length === 0) throw new NotFoundException({ code: 1, message: 'Người dùng chưa có người theo dõi' });

            const followerAndUsers = await Promise.all(followers.map(async (item) => {
                const user = await this.handleUserDatabase.findOneUserById(item.idUser);
                return user ? user.toObject() : null;
            }));

            const totalFollowers = await this.handleFollowDatabase.countDocumentIdFollow(id);

            return {
                code: 0,
                message: 'Success',
                data: followerAndUsers,
                page: {
                    count: followers.length,
                    total: totalFollowers, // Tổng số followers
                    page, // Số trang hiện tại
                    totalPages: Math.ceil(totalFollowers / limit), // Tổng số trang
                }
            };
        } catch (error) { throw error }
    }

    async handleGetFollowing(id: string, page: number = 1, limit: number = 10) {
        try {
            if (!id) throw new BadRequestException({ code: 0, message: 'Missing value' });
            const skip = (page - 1) * limit;

            const followers = await this.handleFollowDatabase.findFollowById(id, skip, limit);
            if (!followers || followers.length === 0) throw new NotFoundException({ code: 1, message: 'Người dùng không theo dõi ai' });

            const followingAndUsers = await Promise.all(followers.map(async (item) => {
                const user = await this.handleUserDatabase.findOneUserById(item.idUser);
                return user ? user.toObject() : null;
            }));
            const totalFollowings = await this.handleFollowDatabase.countDocumentIdUser(id);

            return {
                code: 0,
                message: 'Success',
                data: followingAndUsers,
                page: {
                    count: followingAndUsers.length,
                    total: totalFollowings, // Tổng số followers
                    page, // Số trang hiện tại
                    totalPages: Math.ceil(totalFollowings / limit), // Tổng số trang
                }
            };
        } catch (error) { throw error }
    }

    async acceptFollow(auth: any, id: string) {
        try {
            const { user } = auth;
            const idUser = user?._id.toString();
            const findUserWithId = await this.handleUserDatabase.findAllDataUserById(id);
            if (!findUserWithId) throw new NotFoundException('User follow not found 1');
            const findFollowById = await this.handleFollowDatabase.findOneFollowByIdAndIdFollow(id, idUser);
            if (!findFollowById) throw new NotFoundException('User follow not found');
            await findUserWithId.updateOne({ follower: +findUserWithId.follower + 1 })
            await findFollowById.updateOne({ request: 0 });
            await this.handleNotificationDatabase.deleteNotification(id, idUser, typeNotification.REQUESTFOLLOW);
            return { message: 'ok' }
        } catch (e) { throw e }
    }
}