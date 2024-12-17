import { Injectable, NotFoundException } from "@nestjs/common";
import { HandleUserDatabase } from "@/user/handle/user.db";
import { HandleLikePostDatabase } from "@/like-post/handle";
import { HandlePostDatabase } from "@/post/handle";

@Injectable()
export class HandleLikePostAuth {
    constructor(
        private readonly handleUserDatabase: HandleUserDatabase,
        private readonly handleLikePostDatabase: HandleLikePostDatabase,
        private readonly handlePostDatabase: HandlePostDatabase,
    ) { }
    async checkUserAndPost(idUser: string, idPost: string) {
        try {
            const user = await this.handleUserDatabase.findOneUserById(idUser);
            if (!user) throw new NotFoundException({ code: 1, message: 'User not found' });
            const post = await this.handlePostDatabase.findOnePostById(idPost);
            if (!post) throw new NotFoundException({ code: 2, message: 'Post not found' });
            return { user, post }
        } catch (error) { throw error }
    }
}