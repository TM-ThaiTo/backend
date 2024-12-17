import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { FollowDto } from '@/follows/dto';
import { FollowsService } from '@/follows/follows.service';
import { GetUser, JwtGuard, Roles, RolesGuard } from '@common/index';
import { Role } from '@constants/index';

@Controller('api/v1/follows')
export class FollowsController {

    constructor(
        private readonly followService: FollowsService,
    ) { }

    @Post('/add')
    @UseGuards(JwtGuard)
    async addFollow(@Body() addFollow: FollowDto) {
        return await this.followService.handleAddFollow(addFollow);
    }

    @Delete('/unfollow')
    @UseGuards(JwtGuard)
    async unFollow(@Body() unFollow: FollowDto) {
        return await this.followService.handleUnFollow(unFollow);
    }

    @Get('/follower/:id')
    @UseGuards(JwtGuard)
    async getFollower(
        @Param('id') id: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return await this.followService.handleGetFollower(id, page, limit);
    }

    @Get('/following/:id')
    @UseGuards(JwtGuard)
    async getFollowing(@Param('id') id: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return await this.followService.handleGetFollowing(id, page, limit);
    }

    @Put('/accept-follow')
    @UseGuards(JwtGuard)
    async acceptFollw(@GetUser() auth: any, @Body() dto: { id: string }) {
        return await this.followService.acceptFollow(auth, dto.id);
    }
}
