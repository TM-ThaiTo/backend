import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway'
import { Services } from '@/utils/constants/constants';
import { GatewaySessionManager } from './gateway.session';
import { MessageModule } from '@/chat/p2p/message/message.module';
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@auth/auth.module';

@Module({
    imports: [
        MessageModule,
        UserModule,
        AuthModule
    ],
    providers: [
        ChatGateway, {
            provide: Services.GATEWAY_SESSION_MANAGER,
            useClass: GatewaySessionManager,
        }
    ]
})
export class GatewayModule { }
