import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { HandleUserConversationDB } from './user-conversation.handle';
import { HandleConversationGroupDB } from '../group/conversation-group/handle/conversation-group.db';

@Injectable()
export class UserConversationService {
    constructor(
        private readonly handleUserConversationDB: HandleUserConversationDB,
        private readonly handleConversationGroupDB: HandleConversationGroupDB,
    ) { }

    async create(data: any) {
        try {
            await this.handleUserConversationDB.createUserConversation(data);
        } catch (e) { throw e; }
    }

    async update(data: any, auth: any) {
        try {
            const { user } = auth;
            const idUser = user?._id?.toString();
            const { slug, idConversation, displayName } = data;
            const findUserConversation = await this.handleUserConversationDB.findUserConversationBy_IdUser_IdConversation_Slug(idUser, idConversation, slug);
            if (!findUserConversation) throw new BadRequestException('Không tồn tại');
            await findUserConversation.updateOne({ displayName }).exec();
            return { code: 0, message: 'Success' }
        } catch (e) { throw e; }
    }

    async leaveGroup(data: any, auth: any) {
        try {
            const { user } = auth;
            const idUser = user?._id?.toString();
            const { slug, idConversation, displayName } = data;
            const findUserConversation = await this.handleUserConversationDB.findUserConversationBy_IdUser_IdConversation_Slug(idUser, idConversation, slug);
            if (!findUserConversation) throw new BadRequestException('Không thể truy cập');

            const findConversationGroup = await this.handleConversationGroupDB.findConversationGroupBySlug(slug);
            if (!findConversationGroup) throw new BadRequestException('Không thể truy cập');
            const { owner } = findConversationGroup;
            if (owner === idUser) throw new UnauthorizedException('Đang là trưởng nhóm, không thể rời khỏi nhóm');

            await findConversationGroup.updateOne({
                $pull: { members: idUser },
                totalMember: findConversationGroup.totalMember - 1
            }).exec();

            await findUserConversation.deleteOne().exec();
            return { code: 0, message: 'Success' }
        } catch (e) { throw e; }
    }
}