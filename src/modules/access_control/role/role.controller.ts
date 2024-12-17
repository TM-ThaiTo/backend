import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtGuard } from '@common/guards';
import { PermissionGuard } from '@common/guards/permission.guards';
import { GetUser } from '@common/decorators';

@Controller('/api/v1/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Get('/dashboard')
  @UseGuards(JwtGuard)
  async getRoleDashboard(@GetUser() account: any) {
    return await this.roleService.getRoleDashboard(account);
  }

  @Get('/name')
  // @UseGuards(JwtGuard)
  async getRoleName() {
    return await this.roleService.getRoleName();
  }

  @Get()
  // @UseGuards(JwtGuard, PermissionGuard) 
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.roleService.getAllRole(page, limit);
  }

  @Get(':id')
  // @UseGuards(JwtGuard, PermissionGuard)
  findOne(@Param('id') id: string) {
    console.log('check id: ', id);
    return this.roleService.getRoleById(id);
  }

  @Get(':role_name')
  // @UseGuards(JwtGuard, PermissionGuard)
  findAllPermissionByRoleName(@Param('role_name') role_name: string) {
    return this.roleService.getAllPermissionsByRoleName(role_name);
  }

  @Get('/search/roles')
  // @UseGuards(JwtGuard, PermissionGuard)
  searchRoles(
    @Query('search') search: string = '',
    @Query('roleName') roleName: string = '',
    @Query('active') active: string = '',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.roleService.searchRole(search, roleName, active, page, limit);
  }

  @Put()
  // @UseGuards(JwtGuard, PermissionGuard)
  updateRole(@Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.updateRole(updateRoleDto);
  }

  @Post()
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, PermissionGuard)
  removeRole(@Param('id') id: string) {
    return this.roleService.removeRole(id);
  }
}
