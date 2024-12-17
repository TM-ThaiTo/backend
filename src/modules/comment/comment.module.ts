import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentController } from './controller/comment.controller';
import { CommentService } from './service/comment.service';
import { Comment, CommentSchema } from '@/comment/schema';
import { PostModule } from '@/post/post.module';
import { UserModule } from '@/user/user.module';
import { CommentAdminController } from './controller/comment.admin.controller';
import { CommentAdminService } from './service/comment.admin.service';
import { HttpModule } from '@nestjs/axios';
import { HiddenWordsModule } from '@/hidden_words/hidden_words.module';
import { HandleComment } from './handle/comment';
import { HandleCommentDatabase } from './handle/comment.db';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => PostModule),
    forwardRef(() => HiddenWordsModule)
  ],
  controllers: [CommentController, CommentAdminController],
  providers: [CommentService, CommentAdminService, HandleComment, HandleCommentDatabase],
  exports: [CommentService]
})
export class CommentModule { }
