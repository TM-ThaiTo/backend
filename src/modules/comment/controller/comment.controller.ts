import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommentService } from '../service/comment.service';
import { CreateCommentDto, UpdateCommentDto } from '../dto/index.dto';
import { RolesGuard, Roles, JwtGuard, GetUser } from 'src/common';
import { Role } from 'src/constants';
import { validateId } from '@/utils/validateId';
import Routes from '@/utils/constants/endpoint';

@Controller(Routes.COMMENT)
export class CommentController {

    constructor(
        private readonly commentService: CommentService
    ) { }

    // api: get comment (.../api/v1/comment/get/:slug)
    @Get('/get/:slug')
    @UseGuards(JwtGuard)
    async getComments(
        @Param('slug') slug: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @GetUser() auth: any,
    ) {
        return await this.commentService.handleGetComments(slug, page, limit, auth);
    }

    @Get('/public/get/:slug')
    async getCommentsPublic(
        @Param('slug') slug: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return await this.commentService.handleGetCommentsPublic(slug, page, limit);
    }

    // api: add new comment (.../api/v1/comment/new)
    @Post('/new')
    @UseGuards(JwtGuard)
    async createNewComment(@Body() req: CreateCommentDto) {
        return await this.commentService.createCommentService(req);
    }

    // api: delete comment (.../api/v1/comment/delete)
    @Delete('/delete')
    @UseGuards(JwtGuard)
    async deleteComment(@Body() body: { idComment: string }) {
        return await this.commentService.deleteComment(body.idComment);
    }

    // api: update comment (.../api/v1/comment/update)
    @Patch('/update')
    @UseGuards(JwtGuard)
    async updateComment(@Body() req: UpdateCommentDto) {
        return await this.commentService.updateComment(req);
    }

    // api: get comment child (.../api/v1/comment-child/get/:id)
    @Get('/comment-child/:id')
    @UseGuards(JwtGuard)
    async getCommentChild(@Param('id') id: string) {
        validateId(id);
        return await this.commentService.getCommentsChild(id);
    }
    // @Get('idcomment')
    // async getComment(@Query('id') id: string) {
    //     console.log('check id: ', id);
    //     return await this.commentService.findCommentById(id);
    // }
}
