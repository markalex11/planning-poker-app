import { WebSocket } from 'ws';
import { Rooms } from '../types';
import { syncUsers } from '../utils/roomUtils';
import { JoinMessage, RejectMessage, RevealMessage, RoomStatusMessage, ServerMessageType, TimerStartedMessage } from '../../../shared/sharedTypes';

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

    const alreadyExists = room.users.some((u) => u.socket === ws || u.name === userName);

    if (alreadyExists) {
        console.log(`User ${userName} already exists in room ${roomId}, skipping`);
        const rejectMessage: RejectMessage = {
            type: ServerMessageType.JoinRejected,
            reason: 'Name already taken',
        };
        ws.send(JSON.stringify(rejectMessage));
        return;
    }

    room.users.push({
        name: userName,
        socket: ws,
        voted: false,
        value: null,
    });

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
    // send votes if room in revealStatus
    // if (room.isRevealed) {
    //     const votes = room.users.map(({ name, value }) => ({
    //         userName: name,
    //         value,
    //     }));

    //     const message: RevealMessage = {
    //         type: ServerMessageType.Reveal,
    //         votes,
    //     };
       
    //     ws.send(JSON.stringify(message))
    // }

    syncUsers(roomId, rooms);
}
