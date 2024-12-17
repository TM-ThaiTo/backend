import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReportDocument, Report } from './schemas';
import { PostService } from '@/post/service/post.service';
import { UserService } from '@/user/service/user.service';
import { ContentReportsService } from '@/setting/content-reports/content-reports.service';
import { HandlePostDatabase } from '@/post/handle';
import { HandleUserDatabase } from '@/user/handle/user.db';
import { CommentService } from '@/comment/service/comment.service';
import { HandleMessageDB } from '@/chat/p2p/message/handle';

@Injectable()
export class ReportService {

  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
    private readonly handlePostDatabase: HandlePostDatabase,
    private readonly handleUserDatabase: HandleUserDatabase,
    private readonly commentService: CommentService,
    private readonly handleMessageDatabase: HandleMessageDB,
    private readonly contentReportService: ContentReportsService,
  ) { }

  async checkReportInformation(req: CreateReportDto) {
    try {
      const { idReporter, type, idReport, idContent } = req;

      const reporter = await this.handleUserDatabase.findOneUserById(idReporter);
      if (!reporter) throw new NotFoundException({ code: 4, message: "Người báo cáo không tồn tại" });

      const content = await this.contentReportService.findOneReport(idContent);
      if (!content) throw new NotFoundException({ code: 6, message: "Nôi dung mặc định của report không tồn tại" });

      if (type === 1) {
        const post = await this.handlePostDatabase.findAllOnePost(idReport);
        if (!post) throw new NotFoundException({ code: 3, message: "Post not found" })
        return { post, reporter, content }
      }

      if (type === 2) {
        const user = await this.handleUserDatabase.findOneUserById(idReport);
        if (!user) throw new NotFoundException({ code: 5, message: "Người bị báo cáo không tồn tại" });
        return { user, reporter, content }
      }

      if (type === 3) {
        const comment = await this.commentService.findCommentById(idReport);
        if (!comment) throw new NotFoundException({ code: 7, message: "Comment not found" })
        return { comment, reporter, content }
      }

      if (type === 4) {
        const message = await this.handleMessageDatabase.findOneMessageById(idReport);
        if (!message) throw new NotFoundException({ code: 8, message: "Message not found" })
        return { message, reporter, content }
      }
    } catch (error) { throw error }
  }

  async create(req: CreateReportDto) {
    try {
      const { type } = req;
      const { reporter, content, post, user, comment, message } = await this.checkReportInformation(req);
      await this.reportModel.create(req);

      if (type === 1 && post) {
        const currentReports = post?.reports || 0;
        await post.updateOne({ reports: currentReports + 1 })
      }
      if (type === 2 && user) {
        const currentReports = user?.reports || 0;
        await user.updateOne({ reports: currentReports + 1 })
      }

      const currentReports = content?.quantity || 0;
      await content.updateOne({ quantity: currentReports + 1 })

      return { code: 0, message: 'Success' }
    } catch (error) { throw error }
  }
}
