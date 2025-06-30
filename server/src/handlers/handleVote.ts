import { WebSocket } from 'ws';
import { Rooms } from '../types';
import { sendVotes, syncUsers } from '../utils/roomUtils';
import { VoteMessage } from '../../../shared/sharedTypes';

export function handleVote(parsed: VoteMessage, rooms: Rooms) {
    const { roomId, userName, value } = parsed;

    const room = rooms[roomId];
    if (!room) return;

    console.log(`🗳️ ${userName} voted in room ${roomId}`);

    const user = room.users.find((u) => u.name === userName);
    if (user) {
        user.voted = true;
        user.value = value;
    }

    syncUsers(roomId, rooms);

    const allVoted = room.users.every((u) => u.voted);
    if (allVoted) {
        if (room.timer?.timeoutId) {
            clearTimeout(room.timer.timeoutId);
        }
        sendVotes(roomId, rooms);
    }
}
