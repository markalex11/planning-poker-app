import { ServerMessageType, StartTimerMessage, TimerStartedMessage } from '../../../shared/sharedTypes';
import { Rooms } from '../types';
import { sendToClient, sendVotes } from '../utils/roomUtils';

export function handleStartTimer(parsed: StartTimerMessage, rooms: Rooms) {
    const { roomId, duration } = parsed;
    const now = Date.now();

    const room = rooms[roomId];
    if (!room) return;

    if (room.timer?.timeoutId) {
        clearTimeout(room.timer.timeoutId);
    }

    const timeoutId = setTimeout(() => {
        const room = rooms[roomId];
        if (!room || room.isRevealed) return;
        sendVotes(roomId, rooms);
    }, duration * 1000);

    room.timer = {
        startTime: now,
        duration,
        timeoutId,
    };
    
    const timerMessage: TimerStartedMessage = {
        type: ServerMessageType.TimerStarted,
        startTime: now,
        duration,
    };

    sendToClient(room.users, timerMessage)
}
