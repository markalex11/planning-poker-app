import { ClientMessage, ClientMessageType } from './../../shared/sharedTypes';
import { WebSocketServer, WebSocket } from 'ws';
import { Rooms } from './types';
import { handleJoin } from './handlers/handleJoin';
import { handleVote } from './handlers/handleVote';
import { handleReset } from './handlers/handleReset';
import { sendVotes, syncUsers } from './utils/roomUtils';
import { handleStartTimer } from './handlers/handleStartTimer';

const wss = new WebSocketServer({ port: 3001 });
console.log('✅ WebSocket server running on ws://localhost:3001');

const rooms: Rooms = {};

wss.on('connection', function connection(ws) {
    let currentRoom: string | null = null;
    let currentUser: string | null = null;

    ws.on('message', function message(data) {
        let parsed;

        try {
            parsed = JSON.parse(data.toString());
        } catch {
            console.log('❌ Invalid JSON');
            return;
        }

        const { type, roomId, userName } = parsed;

        switch(type) {
            case ClientMessageType.Join : {
                currentRoom = roomId
                currentUser = userName
                handleJoin(parsed, ws, rooms)
                break
            }
            case ClientMessageType.Vote : {
                handleVote(parsed, rooms)
                break
            }
            case ClientMessageType.Reset: {
                handleReset(parsed, rooms)
                break
            }
            case ClientMessageType.StartTimer : {
                handleStartTimer(parsed, rooms)
                break
            }
        }
    });

    ws.on('close', () => {
        if (currentRoom && currentUser && rooms[currentRoom]) {
            // remove user from room
            // rooms[currentRoom].users = rooms[currentRoom].users.filter(u => u.name !== currentUser);
            rooms[currentRoom].users = rooms[currentRoom].users.filter(u => u.socket !== ws);
            console.log(`❌ ${currentUser} left room ${currentRoom}`);
            syncUsers(currentRoom, rooms)
            // send votes without disconnected user data
            if (rooms[currentRoom]?.isRevealed) {
                sendVotes(currentRoom, rooms)
            }
        }
    });
});

