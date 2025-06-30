import { ClientMessageType, ResetBroadcastMessage, ResetMessage, ServerMessageType } from '../../../shared/sharedTypes';
import { Rooms } from '../types';
import { sendToClient, syncUsers } from '../utils/roomUtils';

export function handleReset(parsed: ResetMessage, rooms: Rooms) {
    const { roomId } = parsed;
    const room = rooms[roomId];
    if (!room) return;

    console.log(`🔄 Resetting round in room ${roomId}`);

    // Сброс голосов
    room.users.forEach((user) => {
        user.voted = false;
        user.value = null;
    });

    if (room.timer?.timeoutId) {
        clearTimeout(room.timer.timeoutId);
    }

    room.timer = null;
    room.isRevealed = false;

    syncUsers(roomId, rooms);

    const resetMessage: ResetBroadcastMessage = {
        type: ServerMessageType.Reset,
        roomId: roomId
    };

    sendToClient(room.users, resetMessage)
}
