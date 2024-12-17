import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
    @Prop({ type: String, required: true }) idUserCreate: string;
    /*
        1: CreatePost, 
        2: Like Post,
        3: comment post, 
        4: Reply comment,
        5: request follow, 
    */
    @Prop({ type: Number, required: true }) type: number;
    @Prop({ type: String, required: true }) idUserReceive: string;
    @Prop({ type: String, required: true }) idContent: string;
    @Prop({ type: Number, default: 0 }) isRead: number; // 0: false, 1: true

    _id?: string;
    createdAt: Date;
    updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);