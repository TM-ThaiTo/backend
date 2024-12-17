import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Query } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { JwtGuard } from '@common/guards';
import { PermissionGuard } from '@common/guards/permission.guards';

@Controller('/api/v1/permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Get()
  // @UseGuards(JwtGuard)
  async getPermissions() {
    return await this.permissionService.getPermissions();
  }

  @Get('module/dashboard')
  async getPermissionsWithDashboard() {
    return await this.permissionService.getPermissionsWithDashboard();
  }

  @Get('/2m')
  async getModuleAndMethodNameList() {
    return await this.permissionService.getModuleAndMethodNameList();
  }

  @Get('/search')
  // @UseGuards(JwtGuard)
  async searchPermissions(
    @Query('search') search: string,
    @Query('method') method: string,
    @Query('module') module: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.permissionService.searchPermissions(search, method, module, page, limit);
  }

  @Get('/all')
  @UseGuards(JwtGuard, PermissionGuard)
  async getAllPermissions(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.permissionService.getAllPermissions(page, limit);
  }

  @Get('/:id')
  // @UseGuards(JwtGuard)
  async getPermissionById(@Param('id') id: string) {
    return await this.permissionService.getPermissionById(id);
  }

  @Post()
  // @UseGuards(JwtGuard)
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return await this.permissionService.createPermission(createPermissionDto);
  }

  @Put('/:id')
  // @UseGuards(JwtGuard)
  async updatePermission(@Param('id') id: string, @Body() updatePermissionDto: CreatePermissionDto) {
    return await this.permissionService.updatePermission(id, updatePermissionDto);
  }

  @Delete('/:id')
  // @UseGuards(JwtGuard)
  async deletePermission(@Param('id') id: string) {
    return await this.permissionService.deletePermission(id);
  }


  @Get('/test/api')
  // @UseGuards(JwtGuard)
  async test() {
    return 'test';
  }
}
