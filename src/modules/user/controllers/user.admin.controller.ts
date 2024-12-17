import { Body, Controller, Get, Param, Patch, Put, Query, UseGuards } from '@nestjs/common';
import { UserAdminService } from '../service/user.admin.service';
import Routes from '@/utils/constants/endpoint';

@Controller(Routes.USERADMIN)
export class UserAdminController {
    constructor(private readonly userAdminService: UserAdminService) { }

    // api: get all user (.../api/v1/user/all)
    @Get('/all')
    // @UseGuards(JwtGuard, RolesGuard)
    // @Roles(Role.SUPER_ADMIN)
    async GetAllUser(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return await this.userAdminService.GetAllUserService(page, limit);
    }

    @Get('/search')
    async GetSearchUser(
        @Query('search') search: string,
        @Query('follower') follower: string | null,
        @Query('following') following: string | null,
        @Query('post') post: string | null,
        @Query('report') report: string | null,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return await this.userAdminService.searchCustomers(search, follower, following, post, report, page, limit);
    }

    // api: update user (.../api/v1/update)
    // @UseGuards(JwtGuard, RolesGuard)
    // @Roles(Role.USER)
    @Put('/update')
    async PutUpdateUser(@Body() req: any) {
        return await this.userAdminService.PutUpdateUserService(req);
    }
}