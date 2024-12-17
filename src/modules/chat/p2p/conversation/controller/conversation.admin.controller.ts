import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import Routes from '@/utils/constants/endpoint';
import { Role } from '@constants/index';
import { RolesGuard, Roles, JwtGuard, GetUser } from 'src/common/index';
import { ConversationAdminService } from '../services/conversation.admin.service';


@Controller(Routes.ADMINCONVERSATION)
export class ConversationAdminController {
    //   constructor(private readonly conversationService: ConversationService) { }

    constructor(
        private readonly conversationAdminService: ConversationAdminService,
    ) { }

    @Get('all')
    async getAllConversations(
        @Query('page') page: number,
        @Query('limit') limit: number,
    ) {
        return await this.conversationAdminService.getAllConversations(page, limit);
    }

    @Get('/search')
    async searchConversation(
        @Query('id') id: string,
        @Query('slug') slug: string,
        @Query('creator') creator: string,
        @Query('recipient') recipient: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
    ) {
        return await this.conversationAdminService.searchConversation(id, slug, creator, recipient, page, limit);
    }
}