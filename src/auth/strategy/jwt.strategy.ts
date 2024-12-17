import { HandleUserDatabase } from '@/user/handle/user.db';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccountService } from '@auth/handle';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        config: ConfigService,
        private readonly accountService: AccountService,
        private readonly handleUserDB: HandleUserDatabase,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_SECRET') || 'default_secret',
        });
    }

    async validate(payload: { sub: string; email: string }) {
        const account = await this.accountService.findOneAccountById(payload.sub);
        if (!account) throw new UnauthorizedException();
        const user = await this.handleUserDB.findOneAllDataUserByIdAccount(account?.id);
        if (!user) throw new UnauthorizedException();
        return { account, user };
    }
}
