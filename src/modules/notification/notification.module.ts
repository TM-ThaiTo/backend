import { forwardRef, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema, Notification } from './schemas/notification.schema';
import { UserModule } from '@/user/user.module';
import { PostModule } from '@/post/post.module';
import { HandleNotificationtDatabase } from './handle/handleNotification.db';
import { CommentModule } from '@/comment/comment.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => PostModule),
    forwardRef(() => CommentModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, HandleNotificationtDatabase],
  exports: [NotificationService, HandleNotificationtDatabase]
})
export class NotificationModule { }
