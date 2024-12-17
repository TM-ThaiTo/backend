import { Body, Controller, Delete, Post } from '@nestjs/common';
import { LikePostService } from './like-post.service';
import { LikePostDto } from './dto';

@Controller('/api/v1/like-post')
export class LikePostController {
    constructor(private readonly likePostService: LikePostService) { }

    @Post()
    async addLikePost(@Body() req: LikePostDto) {
        return await this.likePostService.handleAddLikePost(req);
    }

    @Delete()
    async deleteLikePost(@Body() req: LikePostDto) {
        return await this.likePostService.handleDeleteLikePost(req);
    }
}