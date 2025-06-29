import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Participant = {
    id: string;
    name: string;
    voted: boolean;
    card?: number | string;
};

type RoomState = {
    userName: string;
    roomId: string;
    participants: Participant[];
    myVote?: number | string;
    allVoted: boolean;
    setUserName: (name: string) => void;
    setRoomId: (id: string) => void;
    setParticipants: (p: Participant[]) => void;
    setMyVote: (vote: number | string | undefined) => void;
    resetVotes: () => void;
};

export const useRoomStore = create<RoomState>()(
    persist(
        (set) => ({
            userName: '',
            roomId: '',
            participants: [],
            myVote: undefined,
            allVoted: false,
            setUserName: (name) => set({ userName: name }),
            setRoomId: (id) => set({ roomId: id }),
            setParticipants: (participants) =>
                set({
                    participants,
                    allVoted: participants.every((p) => p.voted),
                }),
            setMyVote: (vote) => set({ myVote: vote }),
            resetVotes: () =>
                set((state) => ({
                    participants: state.participants.map((p) => ({
                        ...p,
                        voted: false,
                        card: undefined,
                    })),
                    myVote: undefined,
                    allVoted: false,
                })),
        }),
        {
            name: 'room-session',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state): RoomState => ({
                userName: state.userName,
                roomId: state.roomId,
                participants: [],
                myVote: undefined,
                allVoted: false,
                setUserName: () => {},
                setRoomId: () => {},
                setParticipants: () => {},
                setMyVote: () => {},
                resetVotes: () => {},
            }),
        }
    )
);
