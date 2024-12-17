import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { LikeComment, LikeCommentDocument } from '../schemas';


@Injectable()
export class HandleLikeCommentDatabase {
    constructor(
        @InjectModel(LikeComment.name) private readonly userModel: Model<LikeCommentDocument>,
    ) { }
}