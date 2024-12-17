import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TokenDocument = Document & Token;

@Schema({ timestamps: true })
export class Token {
    @Prop({ required: true })
    idAccount: Types.ObjectId;

    @Prop({ required: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })
    email: string;

    @Prop({ required: true, default: null })
    refreshToken: string;

    @Prop({ required: true, default: null })
    accessToken: string;

    @Prop({ type: String, default: '' })
    device: string;

    @Prop({ type: String, default: '' })
    ipAddress: string;

    @Prop({ type: Number, default: 0 }) // 0: hoạt động, 2: đăng xuất
    status: number;

    @Prop({ required: true, default: Date.now })
    createdAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);