import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
    @Prop({ required: true })
    idPost: Types.ObjectId;

    @Prop({ required: true })
    idUser: Types.ObjectId;

    @Prop({ required: true, default: null })
    idParent: Types.ObjectId;

    @Prop({ required: true, default: 0 })
    left: number;

    @Prop({ required: true, default: 1 })
    right: number;

    @Prop({ required: true, default: null })
    content: string;

    @Prop({ required: true, default: 0 })
    reply: number;

    @Prop({ required: true, default: 0 })
    like: number;

    @Prop({ type: Number, required: true, default: 0 })
    reports: number;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({ type: Boolean, default: false })
    isHide: boolean;

    _id?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);