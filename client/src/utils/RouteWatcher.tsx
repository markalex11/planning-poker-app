import { useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { socketService, useRoomStore } from '../store/useRoomStore';

const RouteWatcher = () => {
    const location = useLocation();
    const prevPath = useRef(location.pathname);
    const { leaveRoom, joinRoom, roomId, userName } = useRoomStore();

    useEffect(() => {
        const wasInRoom = prevPath.current.startsWith('/room');
        const isNowInRoom = location.pathname.startsWith('/room');

        if (wasInRoom && !isNowInRoom && roomId) {
            leaveRoom();
        }

        if (isNowInRoom && roomId && userName && !socketService.isConnected()) {
            joinRoom(roomId, userName);
        }

        prevPath.current = location.pathname;
    }, [location.pathname]);

    return null;
};

export default RouteWatcher;
