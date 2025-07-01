export enum ClientMessageType {
    Join = 'join',
    Vote = 'vote',
    Reset = 'reset',
    StartTimer = 'start_timer',
}

export enum ServerMessageType {
    Users = 'users',
    Reveal = 'reveal',
    Reset = 'reset',
    RoomStatus = 'room_status',
    TimerStarted = 'timer_started',
    JoinRejected = 'join_rejected'
}

// from client to server
export type JoinMessage = {
    type: ClientMessageType.Join;
    roomId: string;
    userName: string;
};

export type VoteMessage = {
    type: ClientMessageType.Vote;
    roomId: string;
    userName: string;
    value: number;
};

export type StartTimerMessage = {
    type: ClientMessageType.StartTimer;
    roomId: string;
    duration: number;
};

export type ResetMessage = {
    type: ClientMessageType.Reset;
    roomId: string;
};

// from server to client
export type UsersMessage = {
    type: ServerMessageType.Users;
    users: { name: string; voted: boolean }[];
};

export type RevealMessage = {
    type: ServerMessageType.Reveal;
    votes: { userName: string; value: number | null }[];
};

export type RoomStatusMessage = {
    type: ServerMessageType.RoomStatus;
    isRevealed: boolean;
};

export type TimerStartedMessage = {
    type: ServerMessageType.TimerStarted;
    startTime: number;
    duration: number;
};

export type ResetBroadcastMessage = {
    type: ServerMessageType.Reset;
    roomId: string;
}

export type RejectMessage = {
    type: ServerMessageType.JoinRejected;
    reason: string
}



export type ClientMessage =
  | JoinMessage
  | VoteMessage
  | ResetMessage
  | StartTimerMessage;

export type ServerMessage =
  | UsersMessage
  | ResetBroadcastMessage
  | RejectMessage
  | RevealMessage
  | RoomStatusMessage
  | TimerStartedMessage;