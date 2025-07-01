import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type ClientMessage, ClientMessageType, type JoinMessage, type ResetMessage, type ServerMessage, ServerMessageType, type StartTimerMessage, type VoteMessage } from 'shared/sharedTypes';

type User = { name: string; voted: boolean };
type Vote = { userName: string; value: number | null };

type RoomState = {
    socket: WebSocket | null;
    users: User[];
    votes: Vote[];
    myVote?: number | string;
    isRevealed: boolean;
    timerStart: number | null;
    timerDuration: number;
    timeLeft: number | null;
    roomId: string;
    userName: string;
    theme: 'light' | 'dark';

    joinRoom: (roomId: string, userName: string, onSuccess?: () => void, onError?: (reason: string) => void) => void;
    vote: (value: number) => void;
    startTimer: (duration: number) => void;
    resetRound: () => void;
    leaveRoom: () => void;

    setUserName: (name: string) => void;
    setRoomId: (id: string) => void;
    setTimeLeft: (seconds: number | null) => void;
    setTimerDuration: (seconds: number) => void;
    setTheme: (theme: 'light' | 'dark') => void;
};

export const useRoomStore = create<RoomState>()(
    persist(
        (set, get) => ({
            socket: null,
            users: [],
            votes: [],
            myVote: undefined,
            isRevealed: false,
            timerStart: null,
            timerDuration: 30,
            timeLeft: null,
            roomId: '',
            userName: '',
            theme: 'light',

            setUserName: (name) => set({ userName: name }),
            setRoomId: (id) => set({ roomId: id }),
            setTimeLeft: (s) => set({ timeLeft: s }),
            setTimerDuration: (s) => set({ timerDuration: s }),
            setTheme: (theme) => {
                set({ theme });
                // document.documentElement.classList.toggle('dark', theme === 'dark');
            },

            joinRoom: (roomId, userName, onSuccess, onError) => {
                const existingSocket = get().socket;
                console.log(existingSocket?.readyState, 'existing>>>');

                if (existingSocket?.readyState === WebSocket.OPEN || existingSocket?.readyState === WebSocket.CONNECTING) return;

                const socket = new WebSocket('ws://localhost:3001');

                socket.onopen = () => {
                    const message: JoinMessage = { type: ClientMessageType.Join, roomId, userName };
                    sendToServer(socket, message);
                };

                socket.onmessage = (event) => {
                    const data: ServerMessage = JSON.parse(event.data);

                    if (data.type === ServerMessageType.JoinRejected) {
                        onError?.(data.reason || 'Join rejected');
                        socket.close();
                        return;
                    }

                    switch (data.type) {
                        case ServerMessageType.Users:
                            set({ users: data.users });
                            break;
                        case ServerMessageType.Reveal:
                            set({ votes: data.votes, isRevealed: true, timerStart: null, timeLeft: null });
                            break;
                        case ServerMessageType.Reset:
                            set({ votes: [], isRevealed: false, timerStart: null, timeLeft: null, myVote: undefined });
                            break;
                        case ServerMessageType.TimerStarted:
                            set({
                                timerStart: data.startTime,
                                timerDuration: data.duration,
                                timeLeft: data.duration,
                            });
                            break;
                        case ServerMessageType.RoomStatus:
                            set({ isRevealed: data.isRevealed });
                            onSuccess?.();
                            break;
                    }
                };

                socket.onclose = () => {
                    console.log('🔌 socket closed');
                };

                set({ socket, roomId, userName });
            },

            vote: (value) => {
                const { socket, roomId, userName } = get();
                const message: VoteMessage = { type: ClientMessageType.Vote, roomId, userName, value }
                sendToServer(socket, message);
                set({ myVote: value })
            },

            startTimer: (duration) => {
                const { socket, roomId } = get();
                const message: StartTimerMessage = { type: ClientMessageType.StartTimer, roomId, duration }
                sendToServer(socket, message);
            },

            resetRound: () => {
                const { socket, roomId } = get();
                const message: ResetMessage = { type: ClientMessageType.Reset, roomId };
                sendToServer(socket, message);
            },

            leaveRoom: () => {
                const socket = get().socket;
                if (socket?.readyState === WebSocket.OPEN) {
                    socket.close();
                }
                set({
                    socket: null,
                    // roomId: '',
                    // userName: '',
                    users: [],
                    votes: [],
                    myVote: undefined,
                    isRevealed: false,
                    timerStart: null,
                    timeLeft: null,
                });
            }
        }),
        {
            name: 'room-session',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                roomId: state.roomId,
                userName: state.userName,
                theme: state.theme,
                // setRoomId: state.setRoomId,
                // setUserName: state.setUserName,
            }),
        }
    )
);

function sendToServer(socket: WebSocket | null, message: ClientMessage) {
    if (socket?.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(message));
}