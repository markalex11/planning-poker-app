import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 });
console.log('✅ WebSocket server running on ws://localhost:3001');

// Храним участников по roomId
const rooms = {}; // { roomId1: [ { name, socket }, ... ] }

wss.on('connection', function connection(ws) {
    let currentRoom = null;
    let currentUser = null;

    ws.on('message', function message(data) {
        let parsed;

        try {
            parsed = JSON.parse(data);
        } catch {
            console.log('❌ Invalid JSON');
            return;
        }

        const { type, roomId, userName } = parsed;

        // Присоединение к комнате
        if (type === 'join') {
            currentRoom = roomId;
            currentUser = userName;

            if (!rooms[roomId]) {
                rooms[roomId] = [];
            }

            // Проверка на дубликат
            const alreadyExists = rooms[roomId].some(u => u.name === userName);
            if (!alreadyExists) {
                rooms[roomId].push({ name: userName, socket: ws });
            }

            console.log(`👤 ${userName} joined room ${roomId}`);
            broadcastParticipants(roomId);
        }

        if (type === 'vote') {
            console.log(`🗳️ ${userName} voted in room ${roomId}`);

            // Инициализируем votes массив
            if (!rooms[roomId].votes) {
                rooms[roomId].votes = [];
            }

            // Обновляем или добавляем голос
            rooms[roomId].votes = [
                ...rooms[roomId].votes.filter((v) => v.userName !== userName),
                { userName, value: parsed.value },
            ];

            // Рассылаем всем, кто проголосовал (без значения!)
            const votedMessage = JSON.stringify({
                type: 'voted',
                userName,
            });

            rooms[roomId].forEach(({ socket }) => {
                if (socket.readyState === socket.OPEN) {
                    socket.send(votedMessage);
                }
            });

            // Проверяем, все ли проголосовали
            const participantNames = rooms[roomId].map((u) => u.name);
            const votedNames = rooms[roomId].votes.map((v) => v.userName);
            // Если все участники проголосовали — раскрываем
            const allVoted = participantNames.every((name) => votedNames.includes(name));
            if (allVoted) {
                const revealMessage = JSON.stringify({
                    type: 'reveal',
                    votes: rooms[roomId].votes,
                });

                rooms[roomId].forEach(({ socket }) => {
                    if (socket.readyState === socket.OPEN) {
                        socket.send(revealMessage);
                    }
                });
            }


        }
    });

    ws.on('close', () => {
        if (currentRoom && currentUser) {
            // Удаляем пользователя из комнаты
            rooms[currentRoom] = rooms[currentRoom].filter(u => u.name !== currentUser);
            console.log(`❌ ${currentUser} left room ${currentRoom}`);
            broadcastParticipants(currentRoom);
        }
    });
});

// Отправка списка участников всем в комнате
function broadcastParticipants(roomId) {
    const participants = rooms[roomId]?.map(u => u.name) || [];

    const message = JSON.stringify({
        type: 'participants',
        participants,
    });

    rooms[roomId]?.forEach(({ socket }) => {
        if (socket.readyState === socket.OPEN) {
            socket.send(message);
        }
    });
}
