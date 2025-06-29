import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 });
console.log('✅ WebSocket server running on ws://localhost:3001');

// Храним участников по roomId
const rooms = {};

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
                rooms[roomId] = {
                    users: [],
                    timer: null,
                    isRevealed: false,
                };
            }

            const room = rooms[roomId];
            const alreadyExists = room.users.some(u => u.name === userName);
            if (!alreadyExists) {
                room.users.push({
                    name: userName,
                    socket: ws,
                    voted: false,
                    value: null
                });
            }

            console.log(`👤 ${userName} joined room ${roomId}`);

            ws.send(JSON.stringify({
                type: 'room_status',
                isRevealed: rooms[roomId].isRevealed,
            }));

            if (rooms[roomId].timer && !rooms[roomId].isRevealed) {
                ws.send(JSON.stringify({
                    type: 'timer_started',
                    startTime: rooms[roomId].timer.startTime,
                    duration: rooms[roomId].timer.duration,
                }));
            }


            broadcastUsers(roomId)
        }

        if (type === 'vote') {
            console.log(`🗳️ ${userName} voted in room ${roomId}`);

            const user = rooms[roomId].users.find(u => u.name === userName);
            if (user) {
                user.voted = true;
                user.value = parsed.value;
            }

            broadcastUsers(roomId)

            // Проверяем, все ли проголосовали
            const allVoted = rooms[roomId].users.every((u) => u.voted);
            if (allVoted) {

                if (rooms[roomId].timer?.timeoutId) {
                    clearTimeout(rooms[roomId].timer.timeoutId);
                }
                sendVotes(roomId)

                // const votes = rooms[roomId].users.map(({ name, value }) => ({
                //     userName: name,
                //     value
                // }));

                // rooms[roomId].isRevealed = true;

                // const revealMessage = JSON.stringify({
                //     type: 'reveal',
                //     votes,
                // });

                // rooms[roomId].users.forEach(({ socket }) => {
                //     if (socket.readyState === socket.OPEN) {
                //         socket.send(revealMessage);
                //     }
                // });
            }
        }

        if (type === 'reset') {
            console.log(`🔄 Resetting round in room ${roomId}`);

            rooms[roomId].users.forEach((user) => {
                user.voted = false;
                user.value = null;
            });
            // Сброс таймера
            rooms[roomId].timer = null;
            rooms[roomId].isRevealed = false;

            // Рассылаем обновлённый список пользователей
            broadcastUsers(roomId);

            // Удаляем старые результаты (если нужно)
            const resetMessage = JSON.stringify({ type: 'reset' });

            rooms[roomId].users.forEach(({ socket }) => {
                if (socket.readyState === socket.OPEN) {
                    socket.send(resetMessage);
                }
            });
        }

        if (type === 'start_timer') {
            const now = Date.now();

            if (!rooms[roomId]) return;

            // Очистка предыдущего таймера, если был
            if (rooms[roomId].timer?.timeoutId) {
                clearTimeout(rooms[roomId].timer.timeoutId);
            }

            // Сохраняем таймер с ID
            const timeoutId = setTimeout(() => {
                const room = rooms[roomId];
                if (!room || room.isRevealed) return;

                sendVotes(roomId)
                // const votes = room.users
                //     .filter(u => u.voted)
                //     .map(({ name, value }) => ({ userName: name, value }));

                // room.isRevealed = true;

                // const revealMessage = JSON.stringify({
                //     type: 'reveal',
                //     votes,
                // });

                // room.users.forEach(({ socket }) => {
                //     if (socket.readyState === socket.OPEN) {
                //         socket.send(revealMessage);
                //     }
                // });
            }, parsed.duration * 1000);

            rooms[roomId].timer = {
                startTime: now,
                duration: parsed.duration,
                timeoutId,
            };

            // Уведомление клиентов
            const timerMessage = JSON.stringify({
                type: 'timer_started',
                startTime: now,
                duration: parsed.duration,
            });

            rooms[roomId].users.forEach(({ socket }) => {
                if (socket.readyState === socket.OPEN) {
                    socket.send(timerMessage);
                }
            });
        }

    });

    ws.on('close', () => {
        if (currentRoom && currentUser) {
            // Удаляем пользователя из комнаты
            rooms[currentRoom].users = rooms[currentRoom].users.filter(u => u.name !== currentUser);
            console.log(`❌ ${currentUser} left room ${currentRoom}`);
            broadcastUsers(currentRoom)
        }
        if (rooms[currentRoom]?.isRevealed) {
            sendVotes(currentRoom)
        }
    });
});

function broadcastUsers(roomId) {
    const room = rooms[roomId];
    if (!room) return;

    const users = room.users.map(({ name, voted }) => ({ name, voted }));

    const message = JSON.stringify({
        type: 'users',
        users,
    });

    room.users.forEach(({ socket }) => {
        if (socket.readyState === socket.OPEN) {
            socket.send(message);
        }
    });
}

function sendVotes(roomId) {
    const votes = rooms[roomId].users.map(({ name, value }) => ({
        userName: name,
        value
    }));

    rooms[roomId].isRevealed = true;

    const revealMessage = JSON.stringify({
        type: 'reveal',
        votes,
    });

    rooms[roomId].users.forEach(({ socket }) => {
        if (socket.readyState === socket.OPEN) {
            socket.send(revealMessage);
        }
    });
}
