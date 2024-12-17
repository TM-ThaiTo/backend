import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
} from '@nestjs/websockets';

import { OnEvent } from '@nestjs/event-emitter';
import { Socket, Server } from 'socket.io';
import { Inject } from '@nestjs/common';
import { Services } from '@/utils/constants/constants';
import { MessageService } from '@/chat/p2p/message/message.service';
import { AuthenticatedSocket } from './interfaces';
import { IGatewaySessionManager } from './gateway.session';

@WebSocketGateway(3002, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        @Inject(Services.GATEWAY_SESSION_MANAGER)
        readonly sessions: IGatewaySessionManager,
        readonly messageService: MessageService
    ) { }

    @WebSocketServer()
    server: Server;

    handleConnection(socket: AuthenticatedSocket) {
        const { account, user } = socket?.auth;
        this.sessions.setUserSocket(user.id, socket);
        socket.emit('connected', {});
    }
    handleDisconnect(socket: AuthenticatedSocket) {
        const { account } = socket?.auth;
        this.sessions.removeUserSocket(account.id);
    }

    //#region P2P
    // ==================== P2P ====================//
    @SubscribeMessage('onConversationJoin')
    onConversationJoin(client: Socket, roomId: string) {
        try {
            client.join(`conversation-${roomId}`);
            client.emit('userJoin', roomId);
            client.to(`conversation-${roomId}`).emit('userJoin');
        } catch (error) { console.log('-> onConversationJoin error: ', error); }
    }
    @SubscribeMessage('onConversationLeave')
    onConversationLeave(client: Socket, roomId: string) {
        try {
            client.leave(`conversation-${roomId}`);
            client.to(`conversation-${roomId}`).emit('userLeave');
        } catch (error) { console.log('-> onConversationLeave: ', error) }
    }
    @SubscribeMessage('onComposingMessage')
    onComposingMessage(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: any) {
        try {
            const { idRoom, receiver, isComposing } = data;
            const receiverSocket = this.sessions.getUserSocket(receiver);
            if (receiverSocket) {
                receiverSocket.to(`conversation-${idRoom}`).emit('composingMessage', {
                    senderId: client.auth.account.id,
                    receiverId: receiver,
                    isComposing
                });
            }
        } catch (error) { console.log('-> onComposingMessage error: ', error) }
    }
    // ==================== MESSAGE P2P ==================== //
    @OnEvent('message.create', { async: true })
    handleMessageCreated(payload: any) {
        try {
            const { message } = payload;
            const senderSocket = this.sessions.getUserSocket(message?.sender);
            const receiverSocket = this.sessions.getUserSocket(message?.receiver);
            const roomId = `conversation-${message?.idConversation}`;
            const room = this.server.sockets.adapter.rooms.get(roomId);

            if (senderSocket) {
                const senderPayload = payload;
                senderPayload.message.isRead = true;
                senderSocket.emit('lastMessageCreate', senderPayload);
            }

            if (receiverSocket) {
                const receiverPayload = payload;
                receiverPayload.message.isRead = false;
                const isReceiverInRoom = room && room.has(receiverSocket.id);
                if (isReceiverInRoom) {
                    receiverPayload.message.isRead = true;
                    receiverSocket.emit('lastMessageCreate', receiverPayload);
                } else {
                    receiverSocket.emit('lastMessageCreate', receiverPayload);
                }
            }
            this.server.to(roomId).emit('lastMessageCreate', payload);
            this.server.to(roomId).emit('onMessage', payload);
        } catch (error) {
            console.error('-> message.create error: ', error);
        }
    }
    @OnEvent('message.unsend', { async: true })
    handleMessageUnsend(payload: any) {
        try {
            const { message } = payload;
            const senderSocket = this.sessions.getUserSocket(message?.sender);
            const receiverSocket = this.sessions.getUserSocket(message?.receiver);
            const roomId = `conversation-${message?.idConversation}`;
            if (senderSocket) {
                senderSocket.emit('lastMessageUnsend', payload);
            }
            if (receiverSocket) {
                receiverSocket.emit('lastMessageUnsend', payload);
            }
            this.server.to(roomId).emit('onUnsend', payload);
        } catch (error) { console.error('-> message.unsend error: ', error); }
    }
    //#endregion

    //#region Group
    // ==================== GROUP ==================== //
    @SubscribeMessage('onConversationGroupJoin')
    onConversationGroupJoin(client: Socket, roomId: string) {
        try {
            client.join(`conversation-${roomId}`);
            client.emit('userJoin', roomId);
            client.to(`conversation-${roomId}`).emit('userJoin');
        } catch (error) { console.log('-> onConversationGroupJoin error: ', error); }
    }
    @SubscribeMessage('onConversationGroupLeave')
    onConversationGroupLeave(client: Socket, roomId: string) {
        try {
            client.leave(`conversation-${roomId}`);
            client.to(`conversation-${roomId}`).emit('userLeave');
        } catch (error) { console.log('-> onConversationGroupLeave: ', error) }
    }
    @SubscribeMessage('onComposingGroupMessage')
    onComposingGroupMessage(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: any) {
        try {
            const { idRoom, receiver, isComposing } = data;
            const receiverSocket = this.sessions.getUserSocket(receiver);
            if (receiverSocket) {
                receiverSocket.to(`conversation-${idRoom}`).emit('composingMessage', {
                    senderId: client.auth.account.id,
                    receiverId: receiver,
                    isComposing
                });
            }
        } catch (error) { console.log('-> onComposingGroupMessage error: ', error) }
    }
    // ==================== MESSAGE GROUP ==================== //
    @OnEvent('messageGroup.create', { async: true })
    handleMessageGroupCreated(payload: any) {
        try {
            const { message } = payload;
            const roomId = `conversation-${message?.idConversation}`;
            this.server.to(roomId).emit('lastMessageGroupCreate', payload);
            this.server.to(roomId).emit('onMessageGroup', payload);
        } catch (error) { console.error('-> messageGroup.create error: ', error); }
    }
    @OnEvent('messageGroup.unsend', { async: true })
    handleMessageGroupUnsend(payload: any) {
        try {
            console.log('-> handleMessageGroupUnsend: ', payload);
        } catch (error) { console.error('-> messageGroup.unsend error: ', error); }
    }
    //#endregion

    // ==================== CALL ==================== //
    @SubscribeMessage('onCallStart')
    handleCallVoiceStart(client: AuthenticatedSocket, data: any) {
        try {
            const caller = client?.auth?.user;
            const receiverSocket = this.sessions.getUserSocket(data?.receiver);
            const { conversation } = data;
            if (!receiverSocket) {
                return;
            }

            const roomName = `call-conversation-${conversation}`;
            const room = this.server.sockets.adapter.rooms.get(roomName);

            if (!room) {
                client.join(roomName);
                receiverSocket.emit('onVoiceCall', { ...data, caller });
                console.log(`--> First join ${caller?.id}`);
            } else {
                client.join(roomName);
                console.log(`--> Second join ${caller?.id}`);
                client.emit('doneCallVoice');
                this.server.to(roomName).emit('startWebRTC', { roomName });
            }
        } catch (error) {
            console.error('-> onCallVoiceStart error: ', error);
        }
    }

    @SubscribeMessage('onCallEnd')
    handleCallVoiceEnd(client: AuthenticatedSocket, data: any) {
        try {
            const { conversation } = data;
            const roomName = `call-conversation-${conversation}`;
            this.server.to(roomName).emit('endWebRTC');
            this.server.sockets.adapter.rooms.delete(roomName);
        } catch (error) {
            console.error('-> onCallVoiceEnd error: ', error);
        }
    }

    @SubscribeMessage('onRnjectCall')
    handleRejectCallVoice(client: AuthenticatedSocket, data: any) {
        try {
            const { conversation, receiver } = data;
            const receiverSocket = this.sessions.getUserSocket(receiver);
            const roomName = `call-conversation-${conversation}`;
            client.leave(roomName);
            receiverSocket.leave(roomName);
            this.server.to(roomName).emit('rejectCall');
            this.server.sockets.adapter.rooms.delete(roomName);
            console.log('-> handleRejectCallVoice: delete room');
        } catch (error) {
            console.error('-> handleInjectCallVoice: ')
        }
    }

    @SubscribeMessage('audio-signal')
    handleAudioSignal(client: AuthenticatedSocket, payload: any) {
        try {
            console.log('-> HandleAudioSignal Audio signaling received:', payload?.type);
            const targetSocket = this.sessions.getUserSocket(payload.targetId);
            if (targetSocket) {
                targetSocket.emit('audio-signal', payload);
            } else {
                console.log("--> Target socket not found for audio signal");
            }
        } catch (error) {
            console.error('-> handleAudioSignal error: ', error);
        }
    }

    @SubscribeMessage('onRnjectCallVideo')
    handleRejectCallVideo(client: AuthenticatedSocket, data: any) {
        try {
            const { caller } = data;
            const receiverSocket = this.sessions.getUserSocket(caller?._id);
            receiverSocket.emit('rejectCallVideo');
        } catch (error) {
            console.error('-> handleInjectCallVideo: ')
        }
    }

    @SubscribeMessage('video-signal')
    handleVideoSignal(client: AuthenticatedSocket, payload: any) {
        try {
            console.log('-> HandleVideoSignal received:', payload?.type);
            const targetSocket = this.sessions.getUserSocket(payload.targetId);
            if (targetSocket) {
                targetSocket.emit('video-signal', payload);
            } else {
                console.log("--> Target socket not found for video signal");
            }
        } catch (error) {
            console.error('-> handleVideoSignal error: ', error);
        }
    }
}