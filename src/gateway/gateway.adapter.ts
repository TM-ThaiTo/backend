import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AuthenticatedSocket } from './interfaces';
import { UnauthorizedException } from '@nestjs/common';
import { HandleUserDatabase } from '@/user/handle/user.db';
import { AccountService } from '@auth/handle';
export class WebSocketAuthAdapter extends IoAdapter {
    constructor(
        private jwtService: JwtService,
        private accountService: AccountService,
        private readonly handleUserDB: HandleUserDatabase,
    ) {
        super();
    }

    createIOServer(port: number, options?: any) {
        const server = super.createIOServer(port, options);

        server.use(async (socket: AuthenticatedSocket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
            if (!token) { return next(new Error('Authentication token is missing')); }

            try {
                const payload = this.jwtService.verify(token);
                const account = await this.accountService.findOneAccountById(payload.sub);
                if (!account) { throw new UnauthorizedException(); }
                const user = await this.handleUserDB.findOneAllDataUserByIdAccount(account?.id);
                if (!user) { throw new UnauthorizedException(); }

                socket.auth = { account, user };
                next();
            } catch (error) {
                next(new Error('Invalid token or account not found'));
            }
        });


        return server;
    }
}