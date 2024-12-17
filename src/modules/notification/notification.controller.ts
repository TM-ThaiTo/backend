import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtGuard, RolesGuard, Roles, GetUser } from '@common/index';

@Controller('/api/v1/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Get()
  @UseGuards(JwtGuard)
  async getNotificationAll(
    @GetUser() auth: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
  ) {
    return await this.notificationService.getAllNotification(auth, page, limit);
  }


  @Put()
  @UseGuards(JwtGuard)
  async updateIsRead(@Body() data: { id: string }, @GetUser() auth: any,) {
    return await this.notificationService.updateIsRead(data?.id, auth);
  }

  @Get('follow')
  @UseGuards(JwtGuard)
  async getNotificationFollow(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
    @GetUser() auth: any) {
    return await this.notificationService.getNotificationFollow(auth, page, limit);
  }

  @Get('post')
  @UseGuards(JwtGuard)
  async getNotificationPost(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
    @GetUser() auth: any) {
    return await this.notificationService.getNotificationPost(auth, page, limit);
  }

  @Delete('/reject-follow')
  @UseGuards(JwtGuard)
  async rejectFollow(@GetUser() auth: any, @Body() data: { id: string }) {
    return await this.notificationService.rejectFollow(auth, data?.id);
  }
}
