import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateConversationGroupDto } from '../dto/create-conversation-group.dto';
import { UpdateConversationGroupDto } from '../dto/update-conversation-group.dto';
import { HandleConversationGroupDB } from '../handle/conversation-group.db';
import { HandleUserDatabase } from '@/user/handle/user.db';
import { HandleBlockDB } from '@/setting/block/handle/handle.block.db';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from "argon2";
import { HandleUserConversationDB } from '@/chat/user-conversation/user-conversation.handle';
import { AddMember } from '../dto/add-member-conversation-group.dto';

@Injectable()
export class ConversationGroupService {

    constructor(
        private readonly handleConversationGroup: HandleConversationGroupDB,
        private readonly handleUserConversation: HandleUserConversationDB,
        private readonly handleUser: HandleUserDatabase,
        private readonly handleBlock: HandleBlockDB,
    ) { }

    async filterUser(creator: string, dto: CreateConversationGroupDto) {
        const { member } = dto;
        var membersNotFound = [];
        const validMembers = [];
        const names = [];

        for (const item of member) {
            const mem = await this.handleUser.findOneUserById(item);
            if (!mem) membersNotFound.push(item);
            else {
                const id = mem?._id.toString();
                const name = mem?.fullName;
                const checkBlock = await this.handleBlock.checkBlock(id, creator);
                if (checkBlock) membersNotFound.push(id.toString());
                else {
                    names.push(name);
                    validMembers.push(id);
                }
            }
        }
        validMembers.push(creator.toString());
        if (validMembers.length < 3) throw new BadRequestException('Minimum 3 members in group');
        return { validMembers, names };
    }
    async dataPreparation(creator: string, members: any[], names: any[]) {
        try {
            const slug = uuidv4();
            const combinedString = `${creator}:${slug}`;
            const key = await argon2.hash(combinedString);
            const displayName = names.join(', ');
            return {
                slug, creator, key,
                owner: creator,
                totalMember: members.length,
                name: displayName,
                members: members,
                status: 1,
            }
        } catch (e) { throw new BadRequestException('error ') }
    }
    async updateAndSaveGroupChatUser(members: string[], room: any, data: any, names: string[]) {
        const { slug, name } = data;

        for (const item of members) {
            const mem = await this.handleUser.findAllDataUserById(item);
            if (!mem) break;

            const data = {
                idUser: mem?._id,
                idConversation: room?._id.toString(),
                userName: mem?.slug,
                displayName: name,
                status: 0,
                type: 1,
                notification: 1,
                pin: 0,
                slug,
                idDelete: '',
            }
            await this.handleUserConversation.createUserConversation(data);
        }
    }
    async createConversation(dto: CreateConversationGroupDto, auth: any) {
        try {
            const { user } = auth;
            const creator = user?._id;
            const findCeator = await this.handleUser.findOneUserById(creator);
            if (!findCeator) throw new NotFoundException('Creator not found');
            const { validMembers, names } = await this.filterUser(creator, dto); // lọc user
            const data = await this.dataPreparation(creator, validMembers, names); // chuan bi data
            const room = await this.handleConversationGroup.create(data); // save conversation
            await this.updateAndSaveGroupChatUser(validMembers, room, data, names); // update user
            return { code: 0, message: 'ok', data: room }
        } catch (e) {
            console.log('--> check error: ', e);
            throw e;
        }
    }

    async getDataConversation(groupChat: string[]) {
        var dataGroup = [];
        for (const item of groupChat) {
            const group = await this.handleConversationGroup.findConversationGroupBySlug(item);
            if (!group) break;
            else dataGroup.push(group);
        }
        return dataGroup;
    }
    async getDataMember(dataGroup: any[]) {
        const data = [];

        for (const item of dataGroup) { // lượt hết datagroup đang có
            const { owner, members } = item;
            const infoOwer = await this.handleUser.findOneUserById(owner);
            if (!infoOwer) break; // kiểm tra không có chủ phòng bỏ luôn data nay
            else {
                var dataInfoMember = [];
                for (const idMember of members.slice(0, 5)) {
                    const infoMember = await this.handleUser.findOneUserById(idMember);
                    if (!infoMember) break;
                    else dataInfoMember.push(infoMember.toObject());
                }
                const dataWithOwnerAndMember = {
                    ...item.toObject(),
                    owner: infoOwer.toObject(),
                    members: dataInfoMember,
                }
                data.push(dataWithOwnerAndMember);
            }
        }
        return data;
    }
    async getGroupWithUser(auth: any) {
        try {
            const { user } = auth;
            const idUser = user?._id.toString();

            const findConversationGroups = await this.handleUserConversation.findUserConversationByIdUser_Type(idUser, 1);

            const groupAndInfo = await Promise.all(
                findConversationGroups.map(async (item: any) => {
                    const conversation = await this.handleConversationGroup.findConversationGroupBySlug(item?.slug);
                    const { totalMember, lastMessageAt, creator, members } = conversation;
                    const userCreator = await this.handleUser.findOneUserById(creator);
                    const room = item.toObject();

                    const isAdmin = idUser === conversation?.owner ? true : false;
                    return {
                        room: {
                            ...room,
                            totalMember: totalMember,
                            lastMessageAt: lastMessageAt,
                        },
                        owner: userCreator,
                        myUser: user,
                        auth: {
                            isAdmin,
                            isMember: true,
                        }
                    }
                })
            )

            return { code: 0, message: 'ok', data: groupAndInfo };
        } catch (e) { throw e }
    }

    async getGroupConversationBySlug(slug: string, auth: any) {
        try {
            const { user } = auth;
            const idUser = user?._id.toString();

            const findUserConversation = await this.handleUserConversation.findUserConversation_IdUser_Slug(idUser, slug);
            if (!findUserConversation) throw new BadRequestException('Không thể truy cập')

            const findConversationGroup = await this.handleConversationGroup.findConversationGroupBySlug(slug);
            if (!findConversationGroup) throw new BadRequestException('Không thể truy cập')

            const { owner, members } = findConversationGroup;
            const isAdmin: boolean = owner === idUser ? true : false;
            const infoOwner = await this.handleUser.findOneUserById(owner);
            if (!infoOwner) throw new NotFoundException('Chủ phòng không tồn tại');

            let memberAndInfoUser = [];
            for (const item of members) {
                if (item !== owner) {
                    const data = await this.handleUser.findOneUserById(item);
                    memberAndInfoUser.push(data);
                }
                else continue;
            }

            const data = {
                auth: {
                    isAdmin
                },
                user: {
                    myUser: user,
                    owner: infoOwner,
                    members: memberAndInfoUser,
                },
                conversation: {
                    ...findUserConversation.toObject(),
                    key: findConversationGroup?.key,
                    totalMember: findConversationGroup?.totalMember,
                },
            }

            return {
                code: 0,
                message: 'Success',
                data: data,
            }

        } catch (e) { throw e }
    }

    async findUser(key: string, slug: string, page: number, limit: number, auth: any) {
        try {
            const { user } = auth;
            const idUserGet = user?._id.toString();
            const users = await this.handleUser.findUser(key, page, limit);
            const findRoom = await this.handleConversationGroup.findConversationGroupBySlug(slug);
            if (!findRoom) throw new BadRequestException('Room not found');

            let dataUser = [];
            for (const item of users) {
                const idItem = item?._id.toString();
                if (idItem === idUserGet) continue;
                const checkExistConversationUser = await this.handleUserConversation.findUserConversation_IdUser_Slug(idItem, slug);
                if (checkExistConversationUser) continue;
                const checkBlock = await this.handleBlock.checkBlock(idItem, idUserGet);
                if (checkBlock) continue;
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
        } catch (e) { throw e }
    }

    async searchUser(key: string, slug: string, page: number, limit: number, auth: any) {
        try {
            const { user } = auth;
            const idUserGet = user?._id.toString();
            const findRoom = await this.handleConversationGroup.findConversationGroupBySlug(slug);
            if (!findRoom) throw new BadRequestException('Room not found');

            const isAdmin = findRoom?.owner === idUserGet ? true : false;
            const dataOwner = await this.handleUser.findOneUserById(findRoom?.owner);
            const dataAuth = {
                isAdmin,
                isMember: true,
            }
            const members = await this.handleUserConversation.searchUserConversation(key, slug, page, limit);

            let dataMember = [];
            for (const item of members) {
                const idItem = item?.idUser;
                if (idItem === findRoom?.owner) continue;
                const user = await this.handleUser.findOneUserById(idItem);
                if (!user) continue;
                dataMember.push(user)
            }

            const data = {
                owner: dataOwner,
                auth: dataAuth,
                members: dataMember,
            }
            return {
                code: 0,
                message: 'Success',
                data: data,
            }
        } catch (e) { throw e }
    }

    async addMember(dto: AddMember, auth: any) {
        try {
            const { user } = auth;
            const idUser = user?._id.toString();
            const { slug, members } = dto;
            const findRoom = await this.handleConversationGroup.findConversationGroupBySlug(slug);
            if (!findRoom) throw new BadRequestException('Room not found');

            let userC = [];
            for (const item of members) {
                if (item === idUser) continue;
                const checkExistUser = await this.handleUser.findOneUserById(item);
                if (!checkExistUser) continue;
                const checkExistConversationUser = await this.handleUserConversation.findUserConversation_IdUser_Slug(item, slug);
                if (checkExistConversationUser) continue;
                const checkBlock = await this.handleBlock.checkBlock(item, idUser);
                if (checkBlock) continue;
                userC.push(item);
            }
            if (userC.length === 0) throw new BadRequestException('Không có thành viên nào được thêm vào nhóm');

            let userU = [];
            for (const item of userC) {
                const findUser = await this.handleUser.findOneUserById(item);
                if (!findUser) continue;
                const data = {
                    idUser: item,
                    idConversation: findRoom?.id.toString(),
                    userName: findUser?.slug,
                    displayName: findRoom?.name,
                    slug,
                    status: 0,
                    type: 1,
                    notification: 1,
                    pin: 0,
                    idDelete: '',
                }
                await this.handleUserConversation.createUserConversation(data);
                userU.push(item);
            }
            await this.handleConversationGroup.updateConversationGroupBySlug(slug, userU);
            return { code: 0, message: 'Success', }
        } catch (e) { throw e }
    }

    async removeMember(dto: any, auth: any) {
        try {
            const { user } = auth;
            const idUser = user?._id.toString();
            const { slug, member } = dto;

            const findRoom = await this.handleConversationGroup.findConversationGroupBySlug(slug);
            if (!findRoom) throw new BadRequestException('Room not found');
            if (findRoom?.owner !== idUser) throw new BadRequestException('Bạn không phải chủ phòng');

            const findUserConversation = await this.handleUserConversation.findUserConversation_IdUser_Slug(member, slug);
            if (!findUserConversation) throw new BadRequestException('User not found in room');

            await findUserConversation.deleteOne();
            const newRoom = await this.handleConversationGroup.updateRemoveMember(slug, member);

            return { code: 0, message: 'Success', data: newRoom }
        } catch (e) { throw e }
    }
}