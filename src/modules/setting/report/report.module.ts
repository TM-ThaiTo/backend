import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportSchema, Report } from './schemas';
import { PostModule } from '@/post/post.module';
import { UserModule } from '@/user/user.module';
import { ContentReportsModule } from '@/setting/content-reports/content-reports.module';
import { CommentModule } from '@/comment/comment.module';
import { MessageModule } from '@/chat/p2p/message/message.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    PostModule,
    UserModule,
    ContentReportsModule,
    CommentModule,
    MessageModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule { }
