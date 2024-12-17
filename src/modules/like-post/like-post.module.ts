import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '@/user/user.module';
import { PostModule } from '@/post/post.module';
import { HandleLikePostAuth, HandleLikePostDatabase } from '@/like-post/handle';
import { LikePostController } from '@/like-post/like-post.controller';
import { LikePostService } from '@/like-post/like-post.service';
import { LikePost, LikePostSchema, } from '@/like-post/schema';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LikePost.name, schema: LikePostSchema }]),
    UserModule,
    forwardRef(() => PostModule),
    forwardRef(() => NotificationModule),
  ],
  controllers: [LikePostController],
  providers: [LikePostService, HandleLikePostDatabase, HandleLikePostAuth],
  exports: [LikePostService, HandleLikePostDatabase]
})
export class LikePostModule { }
