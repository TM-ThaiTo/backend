import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VerifyDocument = Document & Verify;

@Schema({ timestamps: true })
export class Verify {
    @Prop({
        required: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    })
    email: string;

    @Prop({ required: true })
    type: number;

    @Prop({ required: true })
    code: string;

    @Prop()
    codeExpired: Date;
}

export const VerifySchema = SchemaFactory.createForClass(Verify);