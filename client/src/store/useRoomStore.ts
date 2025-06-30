import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ClientMessageType, type ServerMessage, ServerMessageType } from 'shared/sharedTypes';

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
    joinRoom: (roomId: string, userName: string) => void;
    vote: (value: number) => void;
    setMyVote: (vote: number | string | undefined) => void;
    startTimer: (duration: number) => void;
    resetRound: () => void;
    setTimeLeft: (seconds: number | null) => void;
    setUserName: (name: string) => void;
    setRoomId: (id: string) => void;
    setTimerDuration: (seconds: number) => void
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

            setUserName: (name) => set({ userName: name }),
            setRoomId: (id) => set({ roomId: id }),
            setTimeLeft: (s) => set({ timeLeft: s }),
            setMyVote: (vote) => set({ myVote: vote }),
            setTimerDuration: (s) => set({timerDuration: s}),

            joinRoom: (roomId, userName) => {
                const socket = new WebSocket('ws://localhost:3001');

                socket.onopen = () => {
                    socket.send(JSON.stringify({ type: ClientMessageType.Join, roomId, userName }));
                };

                socket.onmessage = (event) => {
                    const data: ServerMessage = JSON.parse(event.data);
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
                if (socket?.readyState !== WebSocket.OPEN) return;
                socket.send(JSON.stringify({ type: ClientMessageType.Vote, roomId, userName, value }));
            },

            startTimer: (duration) => {
                const { socket, roomId } = get();
                if (socket?.readyState !== WebSocket.OPEN) return;
                socket.send(JSON.stringify({ type: ClientMessageType.StartTimer, roomId, duration }));
            },

            resetRound: () => {
                const { socket, roomId } = get();
                if (socket?.readyState !== WebSocket.OPEN) return;
                socket.send(JSON.stringify({ type: ClientMessageType.Reset, roomId }));
            },
        }),
        {
            name: 'room-session',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                roomId: state.roomId,
                userName: state.userName,
                setRoomId: state.setRoomId,
                setUserName: state.setUserName,
            }),
        }
    )
);