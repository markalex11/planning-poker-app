import { WebSocket } from 'ws';

export type User = {
    name: string;
    socket: WebSocket;
    voted: boolean;
    value: number | null;
};

export type Room = {
    users: User[];
    timer: {
        startTime: number;
        duration: number;
        timeoutId: NodeJS.Timeout;
    } | null;
    isRevealed: boolean;
};

export type Rooms = Record<string, Room>;
