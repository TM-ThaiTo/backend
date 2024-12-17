import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update.dto';
import { STATUS_MESSAGE } from 'src/constants';
import { HandlePostDatabase } from '@/post/handle';
import { HandleUserDatabase } from '../handle/user.db';
import { HandleFollowDatabase } from '@/follows/handle';
import { HandleBlockDB } from '@/setting/block/handle/handle.block.db';

@Injectable()
export class UserService {

    constructor(
        private readonly handleUserDatabase: HandleUserDatabase,
        private readonly handlePostDatabase: HandlePostDatabase,
        private readonly handleFollowDatabase: HandleFollowDatabase,
        private readonly handleBlockDatabase: HandleBlockDB,
    ) { }

    async GetUserBySlugService(slug: string, auth: any) {
        const { account } = auth;
        try {
            const user = await this.handleUserDatabase.findOneUserBySlug(slug);
            if (!user) throw new NotFoundException(STATUS_MESSAGE.USER_MESSAGE.ERROR.USER_NOT_FOUND)

            const data = {
                isMe: slug === account?.userName ? true : false,
                user: user,
            }
            return { code: 0, message: 'Success', data: data }
        } catch (error) { throw error; }
    }

    async getProfileHome(slug: string, auth: any) {
        const { user } = auth;
        try {
            const idUserGet = user?._id?.toString();
            const userAuthor = await this.handleUserDatabase.findOneUserBySlug(slug);
            if (!userAuthor) throw new NotFoundException({ code: 0, message: 'User not found' });

            const idUserAuthor = userAuthor?._id?.toString();
            const checkBlock = await this.handleBlockDatabase.checkBlock(idUserAuthor, idUserGet);
            if (checkBlock) { return { auth: { isBlock: true } } }

            const posts = await this.handlePostDatabase.findPostPublicByIdUser(idUserAuthor, 1, 3, 3);
            const checkFollow = await this.handleFollowDatabase.findOneFollowByIdAndIdFollow(idUserGet, idUserAuthor);

            const isFollow: boolean = checkFollow ? true : false;
            const isMe: boolean = userAuthor?.slug === user?.slug ? true : false;
            return {
                user: userAuthor,
                post: posts,
                auth: {
                    isMe: isMe,
                    isFollow: isFollow,
                }
            }
        } catch (error) { throw error }
    }

    async getInfoUserPublic(slug: string) {
        try {
            const user = await this.handleUserDatabase.findOneUserBySlug(slug);
            if (!user) throw new NotFoundException({ code: 0, message: 'User not found' });
            return { code: 0, message: 'Success', data: user }
        } catch (error) { throw error }
    }

    async getCustomerById(auth: any) {
        try {
            const { user } = auth;
            const customer = await this.handleUserDatabase.findOneCustomerById(user?._id.toString());
            if (!customer) throw new NotFoundException('Customer not found');

            const dataCustomer = {
                ...customer.toObject(),
                privateAccount: customer?.privateAccount === 1,
            }
            return {
                code: 0,
                message: 'Success',
                data: dataCustomer,
            }
        } catch (error) {
            throw new BadRequestException('Error get cusstomer');
        }
    }

    async findUser(key: string, page: number, limit: number, auth: any) {
        try {
            const { user } = auth;

            const users = await this.handleUserDatabase.findUser(key, page, limit);
            if (!users || users.length === 0) throw new NotFoundException('User not found');

            let dataUser = [];
            for (const item of users) {
                if (item?._id.toString() === user?._id.toString()) continue;
                dataUser.push({
                    id: item.id,
                    fullName: item.fullName,
                    userName: item.slug,
                    avatar: item.avatar,
                    bio: item.bio,
                });
            }
            return {
                code: 0,
                message: 'Success',
                data: dataUser,
            }
        } catch (error) {
            if (error instanceof NotFoundException) { throw error; }
            throw new BadRequestException('Error find user');
        }
    }

    async updateProfile(dto: any, auth: any) {
        try {
            const { user } = auth;
            const findUser = await this.handleUserDatabase.findAllDataUserById(user?._id.toString());
            if (!findUser) throw new BadRequestException('User not found');
            const dataUpdate = {
                fullName: dto.fullName || findUser.fullName,
                bio: dto.bio || findUser.bio,
                avatar: dto.avatar || findUser.avatar,
                publicProfile: Number(dto.publicProfile),
                gender: Number(dto.gender),
            }
            await findUser.updateOne(dataUpdate);
            return {
                code: 0,
                message: 'Success',
                data: findUser,
            }
        } catch (error) {
            throw new BadRequestException('Error update profile');
        }
    }

    async updateTheme(auth: any) {
        try {
            const { user } = auth;
            const updateTheme = user.theme === 0 ? 1 : 0;
            await user.updateOne({ theme: updateTheme });
            return { code: 0, message: 'Success', }
        } catch (error) { throw error; }
    }

    async updateLanguge(language: string, auth: any) {
        try {
            const { user } = auth;
            await user.updateOne({ lang: language });
            return { code: 0, message: 'Success', }
        } catch (error) { throw error; }
    }
    async updatePrivacy(auth: any) {
        try {
            const { user } = auth;
            const oldPrivateAccount = user?.privateAccount === 0 ? 1 : 0;
            await user.updateOne({ privateAccount: oldPrivateAccount });
            return { code: 0, message: 'Success', }
        } catch (error) { throw error; }
    }

    // async getSuggestedUser(auth: any) {
    //     try {
    //         const { user } = auth;
    //         const idUserGet = user?._id?.toString();
    //         const findFollows = await this.handleFollowDatabase.findAllFollowById(idUserGet);

    //         if(!findFollows) {
    //         const getUserLarget = await this.handleUserDatabase.getUserFollowLarget(10);
    //         const data = [];
    //         for (const item of getUserLarget) {
    //             const idUser = item?._id?.toString();
    //             const userAuthor = await this.handleUserDatabase.findAllDataUserById(idUser);
    //             if (!userAuthor) continue;

    //             const idUserAuthor = userAuthor?._id?.toString();
    //             const checkBlock = await this.handleBlockDatabase.checkBlock(idUserAuthor, idUserGet);
    //             if (checkBlock) { return { auth: { isBlock: true } } }

    //             const posts = await this.handlePostDatabase.findPostPublicByIdUser(idUserAuthor, 1, 3, 3);
    //             const checkFollow = await this.handleFollowDatabase.findOneFollowByIdAndIdFollow(idUserGet, idUserAuthor);

    //             const isFollow: boolean = checkFollow ? true : false;
    //             const isMe: boolean = userAuthor?.slug === user?.slug ? true : false;
    //             const dataUser = {
    //                 user: userAuthor,
    //                 post: posts,
    //                 auth: {
    //                     isMe: isMe,
    //                     isFollow: isFollow,
    //                 }
    //             }
    //             data.push(dataUser);
    //         }
    //         return { code: 0, message: 'Success', data }
    //         }

    //         for(const item of findFollows){



    //              // const getUserLarget = await this.handleUserDatabase.getUserFollowLarget(10);
    //         // const data = [];
    //         // for (const item of getUserLarget) {
    //         //     const idUser = item?._id?.toString();
    //         //     const userAuthor = await this.handleUserDatabase.findAllDataUserById(idUser);
    //         //     if (!userAuthor) continue;

    //         //     const idUserAuthor = userAuthor?._id?.toString();
    //         //     const checkBlock = await this.handleBlockDatabase.checkBlock(idUserAuthor, idUserGet);
    //         //     if (checkBlock) { return { auth: { isBlock: true } } }

    //         //     const posts = await this.handlePostDatabase.findPostPublicByIdUser(idUserAuthor, 1, 3, 3);
    //         //     const checkFollow = await this.handleFollowDatabase.findOneFollowByIdAndIdFollow(idUserGet, idUserAuthor);

    //         //     const isFollow: boolean = checkFollow ? true : false;
    //         //     const isMe: boolean = userAuthor?.slug === user?.slug ? true : false;
    //         //     const dataUser = {
    //         //         user: userAuthor,
    //         //         post: posts,
    //         //         auth: {
    //         //             isMe: isMe,
    //         //             isFollow: isFollow,
    //         //         }
    //         //     }
    //         //     data.push(dataUser);
    //         // }
    //         // return { code: 0, message: 'Success', data }
    //         } 
    //     } catch (e) { throw e }
    // }
    async getSuggestedUser(auth: any) {
        try {
            const { user } = auth;
            const idUserGet = user?._id?.toString();

            // Lấy danh sách những người mà user đã follow
            const findFollows = await this.handleFollowDatabase.findAllFollowById(idUserGet);
            const followedUserIds = findFollows?.map((follow: any) => follow.followedUserId?.toString()) || [];

            const data = [];
            let suggestedUsers = [];

            if (!findFollows || followedUserIds.length === 0) {
                // Nếu chưa follow ai, lấy 10 người có follower lớn nhất
                suggestedUsers = await this.handleUserDatabase.getUserFollowLarget(10);
            } else {
                // Nếu đã follow, bỏ qua những người đã theo dõi
                suggestedUsers = await this.handleUserDatabase.getUserFollowLarget(50); // Lấy trước nhiều hơn
                suggestedUsers = suggestedUsers.filter((user: any) => !followedUserIds.includes(user._id.toString()));
                suggestedUsers = suggestedUsers.slice(0, 10); // Chỉ lấy tối đa 10 người
            }

            for (const item of suggestedUsers) {
                const idUser = item?._id?.toString();
                const userAuthor = await this.handleUserDatabase.findAllDataUserById(idUser);
                if (!userAuthor) continue;

                const idUserAuthor = userAuthor?._id?.toString();
                const checkBlock = await this.handleBlockDatabase.checkBlock(idUserAuthor, idUserGet);
                if (checkBlock) {
                    return { auth: { isBlock: true } }; // Nếu bị block, trả về thông tin block
                }

                const posts = await this.handlePostDatabase.findPostPublicByIdUser(idUserAuthor, 1, 3, 3);
                const checkFollow = await this.handleFollowDatabase.findOneFollowByIdAndIdFollow(idUserGet, idUserAuthor);

                if (checkFollow) continue;
                if (userAuthor?.slug === user?.slug) continue

                const isFollow: boolean = false;
                const isMe: boolean = false;

                const dataUser = {
                    user: userAuthor,
                    post: posts,
                    auth: {
                        isMe: isMe,
                        isFollow: isFollow,
                    },
                };
                data.push(dataUser);
            }

            return { code: 0, message: 'Success', data };
        } catch (e) {
            throw e;
        }
    }
}