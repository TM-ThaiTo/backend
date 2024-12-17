import { Injectable, NotFoundException } from "@nestjs/common";
import { HandleUserDatabase } from "@/user/handle/user.db";

@Injectable()
export class HandleFollowAuth {
    constructor(
        private readonly handleUserDatabase: HandleUserDatabase
    ) { }

    async checkUser(id: string, idFollow: string) {
        try {
            const user = await this.handleUserDatabase.findOneUserById(id);
            if (!user) throw new NotFoundException("User follow not found");

            const userFollow = await this.handleUserDatabase.findOneUserById(idFollow);
            if (!userFollow) throw new NotFoundException("UserFollow follow not found");

            return { user, userFollow }
        } catch (error) { throw error }
    }
}