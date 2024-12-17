import { Controller, Get, Post, Body, Param, UseGuards, Delete } from '@nestjs/common';
import Routes from '@/utils/constants/endpoint';
import { RolesGuard, Roles, JwtGuard, GetUser } from 'src/common/index';
import { UserConversationService } from './user-conversation.service';


@Controller(Routes.USERCONVERSATION)
export class UserConversationController {
    constructor(
        private readonly userConversationService: UserConversationService
    ) { }

    @Post()
    @UseGuards(JwtGuard)
    updateUserConversation(@Body() data: any, @GetUser() auth: any) {
        return this.userConversationService.update(data, auth);
    }

    @Post('/leave')
    @UseGuards(JwtGuard)
    leaveGroup(@Body() data: any, @GetUser() auth: any) {
        return this.userConversationService.leaveGroup(data, auth);
    }
}