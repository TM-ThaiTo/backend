import { Module, forwardRef } from '@nestjs/common';
import { PostController } from '@/post/controller/post.controller';
import { PostService } from '@/post/service/post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from '@/post/schemas/index';
import { UserModule } from '@/user/user.module';
import { CloudinaryModule } from '@cloudinary/cloudinary.module'
import { CommentModule } from '@/comment/comment.module';
import { PassportModule } from '@nestjs/passport';
import { FollowsModule } from '@/follows/follows.module';
import { LikePostModule } from '@/like-post/like-post.module';
import { PostAuth, HandlePostDatabase } from '@/post/handle';
import { PostAdminController } from './controller/post.admin.controller';
import { PostAdminService } from './service/post.admin.service';
import { HandlePostAdminDatabase } from './handle/post.admin.db';
import { BlockModule } from '@/setting/block/block.module';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    PassportModule.register({}),
    CloudinaryModule,
    FollowsModule,

    forwardRef(() => UserModule),
    forwardRef(() => LikePostModule),
    forwardRef(() => CommentModule),
    forwardRef(() => FollowsModule),
    forwardRef(() => BlockModule),
    forwardRef(() => NotificationModule),
  ],
  controllers: [PostController, PostAdminController],
  providers: [
    PostService, PostAdminService,
    HandlePostDatabase, HandlePostAdminDatabase,
    PostAuth
  ],
  exports: [PostService, HandlePostDatabase],
})
export class PostModule { }
