import type { ClientMessage, ServerMessage } from "shared/sharedTypes";

export type SocketHandlers = {
    onMessage: (data: ServerMessage) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (err: Event) => void;
};

export class SocketService {
    socket: WebSocket | null = null;

    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    connect(url: string, handlers: SocketHandlers) {
        this.socket = new WebSocket(url);

        this.socket.onopen = handlers.onOpen || null;
        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handlers.onMessage(data);
            } catch (e) {
                // TODO log error
            }
        };
        this.socket.onclose = handlers.onClose || null;
        this.socket.onerror = handlers.onError || null;
    }

    send(message: ClientMessage) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        }
    }

    close() {
        this.socket?.close();
        this.socket = null;
    }

    get readyState() {
        return this.socket?.readyState;
    }
}
