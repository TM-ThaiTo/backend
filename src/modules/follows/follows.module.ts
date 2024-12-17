import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from '@/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Follow, FollowSchema } from '@/follows/schema';
import { HandleFollowAuth, HandleFollowDatabase } from '@/follows/handle';
import { FollowsService } from '@/follows/follows.service';
import { FollowsController } from '@/follows/follows.controller';
import { NotificationModule } from '@/notification/notification.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Follow.name, schema: FollowSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => NotificationModule),
  ],
  controllers: [FollowsController],
  providers: [FollowsService, HandleFollowDatabase, HandleFollowAuth],
  exports: [FollowsService, HandleFollowDatabase],
})

export class FollowsModule { }