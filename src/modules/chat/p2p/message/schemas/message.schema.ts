import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
    @Prop({ required: true })
    idConversation: string;

    @Prop({ required: true })
    sender: string; // User ID of the message sender

    @Prop({ required: true })
    receiver: string; // User ID of the message receiver

    @Prop({ required: true })
    content: string; // Text content of the message

    @Prop({ type: String, default: null })
    url: string; // Array of image URLs

    @Prop({ type: String, default: null })
    file: string; // File URL if a file is attached

    @Prop({ type: Boolean, default: false })
    isRead: boolean; // Whether the message has been read

    // 0: text, 1: image, 2: file, 3: video, 4: audio, 5: location, 6: reply, -1: unsend
    @Prop({ type: Number, default: 0 })
    type: number;

    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);