import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from '@/user/service/user.service';
import { User, UserSchema, } from '@/user/schemas/index';
import { PostModule } from '@/post/post.module';
import { FollowsModule } from '@/follows/follows.module';
import { HandleUserDatabase } from '@/user/handle/user.db';
import { UserAdminController } from '@/user/controllers/user.admin.controller';
import { UserController } from '@/user/controllers/user.controller';
import { UserAdminService } from './service/user.admin.service';
import { BlockModule } from '@/setting/block/block.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => PostModule),
    forwardRef(() => FollowsModule),
    forwardRef(() => BlockModule)
  ],
  controllers: [UserAdminController, UserController],
  providers: [UserService, UserAdminService, HandleUserDatabase],
  exports: [UserService, HandleUserDatabase],
})
export class UserModule { }