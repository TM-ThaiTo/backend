import { BadGatewayException, BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateConversationDto } from '@/chat/p2p/conversation/dto';
import { HandleConversationDB } from '@/chat/p2p/conversation/handle'
import { HandleMessageDB } from '@/chat/p2p/message/handle';
import { HandleUserDatabase } from '@/user/handle/user.db';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ConversationAdminService {
    constructor(
        private readonly handleConversationDb: HandleConversationDB,
        private readonly handleMessageDb: HandleMessageDB,
        private readonly handleUserDb: HandleUserDatabase,
    ) { }

    async getAllConversations(page: number, limit: number) {
        try {
            const conversations = await this.handleConversationDb.getAllConversations(page, limit);
            if (!conversations) throw new NotFoundException('No conversations found');
            const totalConversations = await this.handleConversationDb.totalConversations();
            const _query = {
                page: Number(page),
                limit: Number(limit),
                total: totalConversations,
                total_page: Math.ceil(totalConversations / limit)
            }

            return {
                code: 0,
                message: 'Success',
                data: {
                    conversations,
                    _query
                }
            };
        } catch (error) {
            throw new BadGatewayException(error);
        }
    }

    async searchConversation(id: string, slug: string, creator: string, recipient: string, page: number, limit: number) {
        try {
            const { conversations, _query } = await this.handleConversationDb.searchConversation(id, slug, creator, recipient, page, limit);
            if (!conversations) throw new NotFoundException('No conversations found');
            return {
                code: 0,
                message: 'Success',
                data: {
                    conversations,
                    _query
                }
            }
        } catch (error) { throw new BadGatewayException(error) }
    }
}