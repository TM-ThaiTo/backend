import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ConversationGroupService } from '../service/conversation-group.service';
import { CreateConversationGroupDto } from '../dto/create-conversation-group.dto';
import Routes from '@/utils/constants/endpoint'
import { JwtGuard, GetUser } from 'src/common/index';
import { AddMember } from '../dto/add-member-conversation-group.dto';

@Controller(Routes.CONVERSATIONGROUP)
export class ConversationGroupController {
  constructor(private readonly service: ConversationGroupService) { }

  @Post()
  @UseGuards(JwtGuard)
  createConversationGroup(@Body() dto: CreateConversationGroupDto, @GetUser() auth: any) {
    return this.service.createConversation(dto, auth);
  }

  @Post('/add-member')
  @UseGuards(JwtGuard)
  addUserToGroup(@Body() dto: AddMember, @GetUser() auth: any) {
    return this.service.addMember(dto, auth);
  }

  @Get('/all')
  @UseGuards(JwtGuard)
  getConversationGroup(@GetUser() auth: any) {
    return this.service.getGroupWithUser(auth);
  }

  @Get('/room/:slug')
  @UseGuards(JwtGuard)
  getRoomGroupConversation(@Param('slug') slug: string, @GetUser() auth: any) {
    return this.service.getGroupConversationBySlug(slug, auth);
  }

  @Get('/find-user')
  @UseGuards(JwtGuard)
  async GetFindUser(
    @Query('key') key: string,
    @Query('slug') slug: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
    @GetUser() auth: any
  ) {
    return await this.service.findUser(key, slug, page, limit, auth);
  }

  @Get('/search-member')
  @UseGuards(JwtGuard)
  async GetSearchMember(
    @Query('key') key: string,
    @Query('slug') slug: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
    @GetUser() auth: any
  ) {
    return await this.service.searchUser(key, slug, page, limit, auth);
  }

  @Delete('/delete-member')
  @UseGuards(JwtGuard)
  removeMember(@Body() dto: any, @GetUser() auth: any) {
    return this.service.removeMember(dto, auth);
  }
}
