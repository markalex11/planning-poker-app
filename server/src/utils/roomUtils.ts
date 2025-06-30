import { RevealMessage, ServerMessage, ServerMessageType, UsersMessage } from '../../../shared/sharedTypes';
import { Rooms, User } from '../types';
import { WebSocket } from 'ws';

export function syncUsers(roomId: string, rooms: Rooms) {
    const room = rooms[roomId];
    if (!room) return;

    const users = room.users.map(({ name, voted }) => ({ name, voted }));

    const message: UsersMessage = {
        type: ServerMessageType.Users,
        users,
    };

    sendToClient(room.users, message)
}

export function sendVotes(roomId: string, rooms: Rooms) {
    const room = rooms[roomId];
    if (!room) return;

    const votes = room.users.map(({ name, value }) => ({
        userName: name,
        value,
    }));

    room.isRevealed = true;

    const revealMessage: RevealMessage = {
        type: ServerMessageType.Reveal,
        votes,
    };

    sendToClient(room.users, revealMessage)
}

export function sendToClient(users: User[], message: ServerMessage) {
    const serialized = JSON.stringify(message);
    users.forEach(({ socket }) => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(serialized);
        }
    });
}
