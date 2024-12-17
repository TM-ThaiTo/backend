import { Body, Controller, Get, Param, Patch, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from '@/user/service/user.service';
import { UpdateUserDto } from '@/user/dto/update.dto';
import { Role } from '@constants/index';
import { RolesGuard, Roles, JwtGuard, GetUser } from 'src/common/index'
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import Routes from '@/utils/constants/endpoint';

@Controller(Routes.USER)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('/one')
    @UseGuards(JwtGuard)
    async GetOneUserById(@GetUser() auth: any) {
        return await this.userService.getCustomerById(auth);
    }

    @Get('profile/:slug')
    @UseGuards(JwtGuard)
    async GetInfoUser(@Param('slug') slug: string, @GetUser() account) {
        return await this.userService.getProfileHome(slug, account);
    }

    @Get('profile/public/:slug')
    async GetInfoUserPublic(@Param('slug') slug: string) {
        return await this.userService.getInfoUserPublic(slug);
    }

    @Get('/find-user')
    @UseGuards(JwtGuard)
    async GetFindUser(
        @Query('key') key: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 5,
        @GetUser() auth: any
    ) {
        return await this.userService.findUser(key, page, limit, auth);
    }

    @Put('/p-update')
    @UseGuards(JwtGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: new CloudinaryStorage({
                cloudinary: cloudinary,
                params: {
                    folder: 'avatar',
                    resource_type: 'image',
                    public_id: (req, file) => {
                        return `avatar_image-${Date.now()}`;
                    },
                } as any,
            }),
            limits: {
                fileSize: 5 * 1024 * 1024,
            },
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.startsWith('image')) {
                    return callback(new Error('Only image files are allowed'), false);
                }
                callback(null, true);
            },
        }),
    )
    async UpdateUser(
        @Body() dto: any,
        @GetUser() auth: any,
        @UploadedFile() file: Express.Multer.File
    ) {
        const uploadedMedia = [];

        if (file) {
            const cloudinaryFile = file as any;
            uploadedMedia.push(cloudinaryFile.public_id);
            dto.avatar = cloudinaryFile.path || cloudinaryFile.secure_url;
            return await this.userService.updateProfile(dto, auth);
        } else {
            return await this.userService.updateProfile(dto, auth);
        }
    }

    @Put('/update/theme')
    @UseGuards(JwtGuard)
    async UpdateTheme(@GetUser() auth: any) {
        return await this.userService.updateTheme(auth);
    }

    @Put('/update/language')
    @UseGuards(JwtGuard)
    async UpdateLanguage(@Body() data: { language: string }, @GetUser() auth: any) {
        return await this.userService.updateLanguge(data?.language, auth);
    }

    @Put('/update/privacy')
    @UseGuards(JwtGuard)
    async UpdatePrivacy(@GetUser() auth: any) {
        return await this.userService.updatePrivacy(auth);
    }


    @Get('/suggested')
    @UseGuards(JwtGuard)
    async GetSuggestedUser(@GetUser() auth: any) {
        return await this.userService.getSuggestedUser(auth);
    }
}