import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { LikePostModule } from '@/like-post/like-post.module';
import { MailModule } from '@/mail/mail.module';
import { LoggerMiddleware } from '@middleware/index';
import { AuthModule } from '@auth/auth.module';
import { AuthController } from '@auth/controller/auth.controller';
import { CloudinaryModule } from '@cloudinary/cloudinary.module';
import { UserModule } from '@/user/user.module';
import { PostModule } from '@/post/post.module';
import { PostController } from '@/post/controller/post.controller';
import { CommentModule } from '@/comment/comment.module';
import { FollowsModule } from '@/follows/follows.module';
import { CommentController } from '@/comment/controller/comment.controller';
import { ReportModule } from '@/setting/report/report.module';
import { ContentReportsModule } from '@/setting/content-reports/content-reports.module';
import { LikeCommentModule } from '@/like-comment/like-comment.module';
import { GatewayModule } from '@gateway/gateway.module';
import { MessageModule } from '@/chat/p2p/message/message.module';
import { ConversationModule } from '@/chat/p2p/conversation/conversation.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BlockModule } from '@/setting/block/block.module';
import { LanguageModule } from '@/language/language.module';
import { CloudinaryProvider } from '@cloudinary/cloudinary-setting';
import { RoleModule } from '@/access_control/role/role.module';
import { PermissionModule } from '@/access_control/permission/permission.module';
import { PermissionController } from '@/access_control/permission/permission.controller';
import { RoleController } from '@/access_control/role/role.controller';
import { UserController } from '@/user/controllers/user.controller';
import { ConversationGroupModule } from './modules/chat/group/conversation-group/conversation-group.module';
import { MessageGroupModule } from './modules/chat/group/message-group/message-group.module';
import { UserConversationModule } from '@/chat/user-conversation/user-conversation.module';
import { BlockController } from '@/setting/block/controller/block.controller';
import { AppController } from './app.controller';
import { HiddenWordsModule } from './modules/hidden_words/hidden_words.module';
import { NotificationModule } from './modules/notification/notification.module';

require('dotenv').config();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('URL_DATABASE'),
      }),
      inject: [ConfigService],
    }),
    PassportModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        defaultStrategy: configService.get<string>('DEFAULT_STRATEGY'),
      }),
      inject: [ConfigService]
    }),

    EventEmitterModule.forRoot(),
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),

    AuthModule,
    UserModule,
    MailModule,
    PostModule,
    CloudinaryModule,
    CommentModule,
    LikePostModule,
    FollowsModule,
    ReportModule,
    ContentReportsModule,
    LikeCommentModule,
    GatewayModule,
    MessageModule,
    ConversationModule,
    BlockModule,
    LanguageModule,
    RoleModule,
    PermissionModule,
    ConversationGroupModule,
    MessageGroupModule,
    UserConversationModule,
    HiddenWordsModule,
    NotificationModule
  ],

  controllers: [AppController],
  providers: [CloudinaryProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      // .forRoutes('*');
      .forRoutes(
        // AuthController,
        PostController,
        CommentController,
        UserController,
        PermissionController,
        RoleController,
        BlockController
      )
  }
}
