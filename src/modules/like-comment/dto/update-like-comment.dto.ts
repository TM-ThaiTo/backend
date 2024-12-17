import { PartialType } from '@nestjs/mapped-types';
import { CreateLikeCommentDto } from './create-like-comment.dto';

export class UpdateLikeCommentDto extends PartialType(CreateLikeCommentDto) {}
