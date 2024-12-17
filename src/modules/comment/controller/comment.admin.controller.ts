import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CommentAdminService } from '../service/comment.admin.service'
import { CreateCommentDto } from '../dto/index.dto';
import { CommentService } from '../service/comment.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import Routes from '@/utils/constants/endpoint';

@Controller(Routes.ADMINCOMMENT)
export class CommentAdminController {

    constructor(
        private readonly commentAdminService: CommentAdminService,
        private readonly commentService: CommentService,
        private readonly httpService: HttpService
    ) { }

    @Post('/test')
    async test(@Body() data: any) {
        try {
            const response = await lastValueFrom(this.httpService.post(`${process.env.DOMAIN_MODEL}/chat`, data));
            return response.data;
        } catch (error) { throw new Error(`Error fetching data: ${error.message}`); }
    }

    // get comment by id post
    @Get('/all/:id')
    async getAllCommentByIdPost(
        @Param('id') id: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
    ) {
        return await this.commentAdminService.getAllCommentByIdPost(id, page, limit);
    }

    // search comment by id post
    @Get('/search/:id')
    async searchCommentByIdPost(
        @Param('id') id: string,
        @Query('search') search: string,
        @Query('idUser') idUser: string,
        @Query('idPost') idPost: string,
        @Query('idComment') idComment: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
    ) {
        return await this.commentAdminService.searchCommentByIdPost(search, idUser, idPost, idComment, page, limit);
    }

    // create comment
    @Post('/create')
    async createComment(@Body() dto: CreateCommentDto) {
        return await this.commentService.createCommentService(dto);
    }

    // delete comment
    @Delete('/delete/:id')
    async deleteComment(@Param('id') id: string) {
        return await this.commentAdminService.deleteCommentWithAdmin(id);
    }
}