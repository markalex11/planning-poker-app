import { create } from 'zustand';

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
    setMyVote: (vote: number | string) => void;
    resetVotes: () => void;
};

export const useRoomStore = create<RoomState>((set) => ({
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
}));
