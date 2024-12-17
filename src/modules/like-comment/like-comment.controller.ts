import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LikeCommentService } from './like-comment.service';
import { CreateLikeCommentDto } from './dto/create-like-comment.dto';
import { UpdateLikeCommentDto } from './dto/update-like-comment.dto';
import { validateId } from '@/utils/validateId';
import { JwtGuard, RolesGuard, Roles } from '@common/index';
import { Role } from '@constants/index';

@Controller('like-comment')
export class LikeCommentController {
  constructor(private readonly likeCommentService: LikeCommentService) { }

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() createLikeCommentDto: CreateLikeCommentDto) {
    return this.likeCommentService.create(createLikeCommentDto);
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.USER)
  findAll() {
    return this.likeCommentService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.USER)
  findOne(@Param('id') id: string) {
    validateId(id);
    return this.likeCommentService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.USER)
  update(@Param('id') id: string, @Body() updateLikeCommentDto: UpdateLikeCommentDto) {
    validateId(id);
    return this.likeCommentService.update(+id, updateLikeCommentDto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.USER)
  remove(@Param('id') id: string) {
    validateId(id);
    return this.likeCommentService.remove(+id);
  }
}
