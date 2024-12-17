import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageGroupDocument = HydratedDocument<MessageGroup>;

@Schema({ timestamps: true })
export class MessageGroup {
    @Prop({ type: String, required: true }) idConversation: string;
    @Prop({ type: String, required: true }) sender: string; // User ID of the MessageGroup sender
    @Prop({ type: String, required: true }) content: string; // Text content of the MessageGroup
    @Prop({ type: String, default: null }) url: string; // Array of image URLs
    @Prop({ type: String, default: null }) file: string; // File URL if a file is attached
    @Prop({ type: Boolean, default: false }) isRead: boolean; // Whether the MessageGroup has been read
    @Prop({ type: Number, default: 0 }) type: number;// 0: text, 1: image, 2: file, 3: video, 4: audio, 5: location, 6: reply, -1: unsend

    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const MessageGroupSchema = SchemaFactory.createForClass(MessageGroup);