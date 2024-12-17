import { HandleHiddenWordsDatabase } from "@/hidden_words/handle/handle.hiddenWord.db";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Comment, CommentDocument } from "../schema";
import { Model } from "mongoose";

@Injectable()
export class HandleComment {
    constructor(
        @InjectModel(Comment.name) private readonly commentPostModel: Model<CommentDocument>,
        private readonly handleHiddenWorksDatabase: HandleHiddenWordsDatabase,
    ) { }






    async updateReplayCommentParent(id: string) {
        try {
            const comment = await this.commentPostModel.findById(id);
            comment.reply += 1;
            await comment.save();
            return comment.reply;
        } catch (error) { throw error }
    }
    async checkCommentWithCusstomHidden(content: any, cusstomHidden: any) {
        const wordHidden = cusstomHidden;
        if (wordHidden) {
            const data = wordHidden.split(/,(?![^"]*"(?=[^"]*"$))/);
            const cleanedData = data.map(item => item.replace(/\s+/g, ' ').trim());
            const isHidden = cleanedData.some(hiddenWord => {
                return content.toLowerCase().includes(hiddenWord.toLowerCase());
            });
            if (isHidden) throw new BadRequestException('Invalid content')
        }
    }

    async checkHiddenComment(idAuthor: string, content: string) {
        try {
            const findHidden = await this.handleHiddenWorksDatabase.findOneByIdUser(idAuthor);
            if (!findHidden) return;
            const {
                hideComments,
                commentfiltering,
                hideCommentWithCustomHidden,
                cusstomHidden
            } = findHidden;

            if (hideCommentWithCustomHidden === 1) this.checkCommentWithCusstomHidden(content, cusstomHidden);
            if (hideComments === 1) return;
            if (commentfiltering === 1) return;

        } catch (e) { throw e }
    }
}