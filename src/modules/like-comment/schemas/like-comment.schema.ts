import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LikeCommentDocument = HydratedDocument<LikeComment>;

@Schema({ timestamps: true })
export class LikeComment {
    @Prop({ required: true })
    idPost: Types.ObjectId;

    @Prop({ required: true })
    idUser: Types.ObjectId;

    @Prop({ required: true })
    idComment: Types.ObjectId;
}

export const LikeCommentSchema = SchemaFactory.createForClass(LikeComment);