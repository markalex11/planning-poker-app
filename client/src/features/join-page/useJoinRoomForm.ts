import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomStore } from '../../store/useRoomStore';

export function useJoinRoomForm() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState(false);
    const [roomIdInput, setRoomIdInput] = useState('');
    const { joinRoom, setUserName, setRoomId } = useRoomStore();

    const onNameChange = (value: string) => {
        setName(value);
        if (nameError && value.trim()) setNameError(false);
    };

    const handleJoin = () => {
        if (!name.trim()) {
            setNameError(true);
            return;
        }
        setNameError(false);

        const finalRoomId = roomIdInput.trim() || crypto.randomUUID();

        setUserName(name.trim());
        setRoomId(finalRoomId);

        joinRoom(
            finalRoomId,
            name,
            () => navigate(`/room/${finalRoomId}`),
            (err) => {
                console.error(err);
                setNameError(true);
            }
        );
    };

    return {
        name,
        setName,
        nameError,
        roomIdInput,
        setRoomIdInput,
        onNameChange,
        handleJoin,
    };
}
