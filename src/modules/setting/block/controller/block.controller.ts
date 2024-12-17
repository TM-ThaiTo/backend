import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BlockService } from '../service/block.service';
import { CreateBlockDto } from '../dto/create-block.dto';
import { validateId } from '@/utils/validateId';
import { JwtGuard, GetUser } from 'src/common/index';
import Routes from '@/utils/constants/endpoint'
@Controller(Routes.BLOCK)
export class BlockController {
  constructor(
    private readonly blockService: BlockService,
  ) { }

  @Post()
  @UseGuards(JwtGuard)
  async createBlock(@Body() dto: CreateBlockDto, @GetUser() auth: any) {
    return this.blockService.create(dto, auth);
  }

  @Delete()
  @UseGuards(JwtGuard)
  deleteBlock(@Body() dto: CreateBlockDto, @GetUser() auth: any) {
    return this.blockService.delete(dto, auth);
  }

  @Get('all/:id')
  findAllByIdUser(@Param('id') id: string) {
    validateId(id);
    return this.blockService.findAllByIdUser(id);
  }

  @Get('/check/:id')
  @UseGuards(JwtGuard)
  checkBlock(@Param('id') id: string, @GetUser() auth: any) {
    validateId(id);
    return this.blockService.checkBlock(id, auth)
  }


  @Get()
  @UseGuards(JwtGuard)
  getAllBlockAndPageLimit(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @GetUser() auth: any,
  ) {
    return this.blockService.getAllBlockAndPageLimit(page, limit, auth);
  }
}
