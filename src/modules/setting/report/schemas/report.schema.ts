import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReportDocument = HydratedDocument<Report>;

@Schema({ timestamps: true })
export class Report {

    @Prop({ required: true, default: null })
    idReporter: string; // người báo cáo

    // 1: post, 
    // 2: user,
    // 3: comment,
    // 4: message
    @Prop({ type: Number, required: true, default: 1 })
    type: number;

    @Prop({ required: true })
    idReport: string; // người bị báo cáo

    @Prop({ default: null })
    idContent?: string;

    @Prop({ default: null })
    other?: string;

    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
