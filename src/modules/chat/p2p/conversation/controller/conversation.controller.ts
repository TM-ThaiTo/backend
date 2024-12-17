import { Controller, Get, Post, Body, Param, UseGuards, Delete } from '@nestjs/common';
import { ConversationService } from '../services/conversation.service';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import Routes from '@/utils/constants/endpoint';
import { Role } from '@constants/index';
import { RolesGuard, Roles, JwtGuard, GetUser } from 'src/common/index';


@Controller(Routes.CONVERSATION)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) { }

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() dto: CreateConversationDto, @GetUser() account: any) {
    return this.conversationService.createConversationNoNewMessage(dto, account);
  }

  @Get()
  @UseGuards(JwtGuard)
  getConversationByIdUser(@GetUser() account: any) {
    return this.conversationService.getConversationByIdUser(account);
  }

  @Get('padding')
  @UseGuards(JwtGuard)
  getConversationPaddingByUser(@GetUser() account: any) {
    return this.conversationService.getConversationPaddingUser(account);
  }

  @Get('/room/:slug')
  @UseGuards(JwtGuard)
  getDetailConversationBySlugConversation(@Param('slug') slug: string, @GetUser() auth: any) {
    return this.conversationService.getDetailConversationBySlugConversation(slug, auth);
  }

  @Delete('/:id')
  @UseGuards(JwtGuard)
  deleteMessage(@Param('id') id: string, @GetUser() auth: any) {
    return this.conversationService.deleteMessageByRoom(id, auth);
  }
}
