import { WebSocket } from 'ws';
import { Rooms } from '../types';
import { syncUsers } from '../utils/roomUtils';
import { JoinMessage, RoomStatusMessage, ServerMessageType, TimerStartedMessage } from '../../../shared/sharedTypes';

export function handleJoin(parsed: JoinMessage, ws: WebSocket, rooms: Rooms) {
    const { roomId, userName } = parsed;

    if (!rooms[roomId]) {
        rooms[roomId] = {
            users: [],
            timer: null,
            isRevealed: false,
        };
    }

    const room = rooms[roomId];

    const alreadyExists = room.users.some((u) => u.name === userName);

    if (!alreadyExists) {
        room.users.push({
            name: userName,
            socket: ws,
            voted: false,
            value: null,
        });
    }

    console.log(`👤 ${userName} joined room ${roomId}`);

    // share room Revealed status
    const statusMessage: RoomStatusMessage = {
        type: ServerMessageType.RoomStatus,
        isRevealed: room.isRevealed,
    }
    ws.send(JSON.stringify(statusMessage));

    // send timer if activated
    if (room.timer && !room.isRevealed) {
        const timerMessage: TimerStartedMessage = {
            type: ServerMessageType.TimerStarted,
            startTime: room.timer.startTime,
            duration: room.timer.duration,
        }
        ws.send(JSON.stringify(timerMessage));
    }
    
    syncUsers(roomId, rooms);
}
