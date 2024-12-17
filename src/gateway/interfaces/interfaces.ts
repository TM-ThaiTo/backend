import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
    auth?: {
        account: any,
        user: any
    };
}