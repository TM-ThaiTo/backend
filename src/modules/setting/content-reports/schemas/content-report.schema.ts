import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContentReportDocument = HydratedDocument<ContentReport>;

@Schema({ timestamps: true })
export class ContentReport {
    // 1: post, 
    // 2: user,
    // 3: comment,
    // 4: message
    @Prop({ type: Number, required: true, default: 0 })
    type: number;

    @Prop({ required: true, default: null })
    titleVN: string;

    @Prop({ required: true, default: null })
    titleEN: string;

    @Prop({ required: true, default: null })
    contentVN: string;

    @Prop({ required: true, default: null })
    contentEN: string;

    @Prop({ type: Number, required: true, default: 0 })
    quantity: number;

    @Prop({ required: true, default: true })
    open: boolean;

    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const ContentReportSchema = SchemaFactory.createForClass(ContentReport);