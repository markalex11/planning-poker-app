import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ClientMessageType, type JoinMessage, type ResetMessage, type ServerMessage, ServerMessageType, type StartTimerMessage, type VoteMessage } from 'shared/sharedTypes';
import { SocketService } from '../service/SocketService';

export type User = { name: string; voted: boolean };
export type Vote = { userName: string; value: number | null };

type RoomState = {
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

// init service
export const socketService = new SocketService();

export const useRoomStore = create<RoomState>()(
    persist(
        (set, get) => ({
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
            setTheme: (theme) => { set({ theme }); },

            joinRoom: (roomId, userName, onSuccess, onError) => {
                if (socketService?.readyState === WebSocket.OPEN || socketService?.readyState === WebSocket.CONNECTING) return;

                socketService.connect("ws://localhost:3001", {
                    onOpen: () => {
                        const message: JoinMessage = { type: ClientMessageType.Join, roomId, userName };
                        socketService.send(message);
                    },
                    onMessage: (data: ServerMessage) => {
                        if (data.type === ServerMessageType.JoinRejected) {
                            onError?.(data.reason || "Join rejected");
                            socketService.close();
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
                                set({ timerStart: data.startTime, timerDuration: data.duration, timeLeft: data.duration });
                                break;
                            case ServerMessageType.RoomStatus:
                                set({ isRevealed: data.isRevealed });
                                onSuccess?.();
                                break;
                        }
                    },
                    onClose: () => {
                        set({ users: [], votes: [], myVote: undefined, isRevealed: false, timerStart: null, timeLeft: null });
                    },
                });
                set({ roomId, userName });
            },

            vote: (value) => {
                const { roomId, userName } = get();
                const message: VoteMessage = { type: ClientMessageType.Vote, roomId, userName, value }
                socketService.send(message);
                set({ myVote: value })
            },

            startTimer: (duration) => {
                const { roomId } = get();
                const message: StartTimerMessage = { type: ClientMessageType.StartTimer, roomId, duration }
                socketService.send(message);
            },

            resetRound: () => {
                const { roomId } = get();
                const message: ResetMessage = { type: ClientMessageType.Reset, roomId };
                socketService.send(message);
            },

            leaveRoom: () => {
                if (socketService?.readyState === WebSocket.OPEN) {
                    socketService.close();
                }
                set({ users: [], votes: [], myVote: undefined, isRevealed: false, timerStart: null, timeLeft: null });
            }
        }),
        {
            name: 'room-session',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                roomId: state.roomId,
                userName: state.userName,
                theme: state.theme,
            }),
        }
    )
);