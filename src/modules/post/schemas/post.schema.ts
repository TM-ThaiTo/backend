import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

class ListUrl {
    @Prop({ type: Number, required: true }) type: number;
    @Prop({ type: String, required: true }) url: string;
    @Prop({ type: String, default: '' }) thumbnail: string;
    @Prop({ type: Number, required: true }) width: number;
    @Prop({ type: Number, required: true }) height: number;
    @Prop({ type: Number, default: 0 }) timeStart: number;
    @Prop({ type: Number, default: 0 }) timeEnd: number;
    @Prop({ type: String, default: '' }) accessibility: string;
    @Prop({ type: Boolean, default: true }) soundOn: boolean;
}

@Schema({ timestamps: true })
export class Post {
    @Prop({ required: true }) idUser: string;// poster
    @Prop({ required: true }) slug: string;// slug
    @Prop({ required: true }) title: string;// title post
    @Prop({ required: true }) type: number; // type: 1: image, 2: video, 3: text
    @Prop({ required: true, default: 1 }) status: number;// status post  1: public, 2: private, 3: share
    @Prop({ type: String, default: '' }) content: string;// content: vd: 'Hello I'm Alex,...'
    @Prop({ type: [ListUrl], required: true }) listUrl: ListUrl[];// list image for post
    @Prop({ type: [String], default: [] }) tag: string[];// list user tag
    @Prop({ type: [String], default: [] }) collab: string[];// list user collab
    @Prop({ type: String, default: '' }) location: string;

    //======= Like =======//
    @Prop({ type: Number, required: true, default: 0 }) hideLikes: number;// 0: false, 1: true
    @Prop({ type: Number, required: true, default: 0 }) likes: number;// total like

    //======= Comment =======//
    @Prop({ type: Number, required: true, default: true }) openComment: number;//  0: false, 1: true
    @Prop({ type: Number, required: true, default: 0 }) comments: number;// total comment

    //======= Flag ======= //
    @Prop({ type: Number, required: true, default: 0 }) flag: number;// flag post 1: normal, 2: warning, 3: danger
    @Prop({ type: Number, required: true, default: 0 }) reports: number;// total report
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({
    content: 'text',
});