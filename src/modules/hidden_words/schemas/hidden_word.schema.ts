import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HiddenWordDocument = HydratedDocument<HiddenWord>;

@Schema({ timestamps: true })
export class HiddenWord {
    @Prop({ type: String, required: true }) idUser: string;

    // hide comments: theo AI
    @Prop({ default: 0 }) hideComments: number; // 0: false, 1: true

    // hide comments: theo AI cấp cao
    @Prop({ default: 0 }) commentfiltering: number; // 0: false, 1: true

    // hide message request
    @Prop({ default: 0 }) hideMessageRequests: number; // 0: false, 1: true

    // custom hidden 
    @Prop({ type: String, default: null }) cusstomHidden: string;
    @Prop({ default: 0 }) hideCommentWithCustomHidden: number;
}

export const HiddenWordSchema = SchemaFactory.createForClass(HiddenWord);