import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { GetUser, JwtGuard } from 'src/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { PostService } from '@/post/service/post.service';
import { CreatePostDto, UpdatePostDto, CreatePostVideoDto } from '@/post/dto/index.dto';
import { CloudinaryService } from '@cloudinary/cloudinary.service';
import Routes from '@/utils/constants/endpoint';
@Controller(`${Routes.POST}`)
export class PostController {
    constructor(
        private readonly postService: PostService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    // api: GET post home
    @Get('/home')
    @UseGuards(JwtGuard)
    async GetAllPost(@Query('page') page: number = 1, @Query('limit') limit: number = 10, @GetUser() account: any) {
        return await this.postService.GetPostHome(page, limit, account);
    }

    // api: POST create post (.../api/v1/post/create)
    @Post('/create')
    @UseGuards(JwtGuard)
    async CreatePostStatus(@Body() dto: CreatePostDto, @GetUser() auth) {
        return await this.postService.CreatePostStatusService(dto, auth);
    }

    @Post('/create/image')
    @UseGuards(JwtGuard)
    async CreatePostImage(@Body() dto: CreatePostDto, @GetUser() auth) {
        return await this.postService.CreatePostImageOnly(dto, auth);
    }

    @Post('/create/video')
    @UseInterceptors(FilesInterceptor('files', 2))
    @UseGuards(JwtGuard)
    async createPostVideo(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() req: CreatePostVideoDto
    ) {
        const uploadedMedia = [];
        try {
            if (!files || files.length < 2) {
                throw new BadRequestException('Both video and thumbnail files are required');
            }
            const videoFile = files.find(file => file.mimetype.startsWith('video/'));
            const thumbnailFile = files.find(file => file.mimetype.startsWith('image/'));
            const userId = req?.idUser;
            if (!videoFile || !thumbnailFile) {
                throw new BadRequestException('Video or thumbnail file is missing');
            }
            const { timeStart, timeEnd, width, height, soundOn } = req?.url?.file;
            const soundOnAsBoolen: boolean = soundOn.toString() === 'true' ? true : false
            console.log('ccheck soundOn: ', soundOnAsBoolen);
            const videoUrl = await this.cloudinaryService.uploadVideoCrop(
                videoFile, userId, width, height, timeStart, timeEnd, soundOnAsBoolen
            );

            const thumbnailUrl = await this.cloudinaryService.uploadImage(thumbnailFile);

            uploadedMedia.push(videoUrl.public_id, thumbnailUrl.public_id);

            const data = {
                ...req,
                url: {
                    ...req.url,
                    file: {
                        ...req.url.file,
                        urlVideo: videoUrl.secure_url,
                    },
                    thumbnail: thumbnailUrl.secure_url,
                },
            }
            return await this.postService.CreatePostVideoService(data);
        } catch (error) {
            console.error('Error processing video and thumbnail: ', error);
            if (uploadedMedia.length > 0) {
                await Promise.all(uploadedMedia.map(async (publicId) => {
                    return cloudinary.uploader.destroy(publicId);
                }));
            }
            throw new BadRequestException('Video or thumbnail processing failed.');
        }
    }

    // api: GET all post by slug user (.../api/v1/post/user/{slug})
    @Get('/user/:slug')
    @UseGuards(JwtGuard)
    async GetPostUser(@Param('slug') slug: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10, @GetUser() account) {
        return await this.postService.GetPostToProfile(slug, account, page, limit);
    }

    // api: get detail post
    @Get(':slug')
    @UseGuards(JwtGuard)
    async GetAllPostBySlug(@Param('slug') slug: string, @GetUser() account) {
        return await this.postService.GetDetilPostBySlugAuth(slug, account);
    }

    @Get('/user-public/:slug')
    @UseGuards(JwtGuard)
    async GetPostUserPublic(
        @Param('slug') slug: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 6,
        @GetUser() auth: any
    ) {
        return await this.postService.GetPostToProfilePublic(slug, page, limit, auth);
    }

    // api: get detail post public
    @Get(':slug/no-auth')
    async GetAllPostBySlugNoAuth(@Param('slug') slug: string) {
        return await this.postService.GetPostBySlugAuthNoAuth(slug);
    }

    // api: PATCH update post (.../api/v1/post/update)
    @Patch('update')
    @UseGuards(JwtGuard)
    async UpdatePostByUser(@Body() req: UpdatePostDto, @GetUser() account) {
        return await this.postService.UpdatePostService(req, account);
    }

    // api: hide like (.../api/v1/post/update/like)
    @Patch('update/like')
    @UseGuards(JwtGuard)
    async UpdateLikePost(@Body() body: { slug: string }, @GetUser() account) {
        return await this.postService.UpdateLikeService(body?.slug, account);
    }

    // api: hide like (.../api/v1/post/update/comment)
    @Patch('update/comment')
    @UseGuards(JwtGuard)
    async UpdateCommentPost(@Body() body: { slug: string }, @GetUser() account) {
        return await this.postService.UpdateCommentService(body?.slug, account);
    }

    // api: public post (.../api/v1/post/update/public)
    @Patch('update/public')
    @UseGuards(JwtGuard)
    async UpdatePublicPost(@Body() body: { slug: string }, @GetUser() account) {
        return await this.postService.UpdatePublicPostService(body?.slug, account);
    }

    // api: DELETE post (.../api/v1/post/delete)
    @Delete('delete')
    @UseGuards(JwtGuard)
    async DeletePostByUser(@Body() body: { id: string }, @GetUser() account) {
        if (!body) { throw new BadRequestException("Missing Value") }
        return await this.postService.DeletePostService(body?.id, account);
    }

    // api: get all post 
    @Get('all')
    @UseGuards(JwtGuard)
    async GetAllPostAdmin(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return await this.postService.GetAllPostService(page, limit);
    }

    @Get('/status-post')
    @UseGuards(JwtGuard)
    async GetPostStatus(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return await this.postService.GetAllPostService(page, limit);
    }

    @Get('/video/reels')
    @UseGuards(JwtGuard)
    async getReels(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @GetUser() auth: any,
    ) {
        return await this.postService.getReels(page, limit, auth);
    }

    @Get('/media/explore')
    @UseGuards(JwtGuard)
    async GetExplore(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @GetUser() auth: any,
    ) {
        return await this.postService.getExplore(page, limit, auth);
    }
}