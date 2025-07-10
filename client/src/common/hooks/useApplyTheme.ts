import { useEffect } from 'react';
import { useRoomStore } from '../../store/useRoomStore';

export function useApplyTheme() {
    const theme = useRoomStore((s) => s.theme);

    useEffect(() => {
        const { theme } = useRoomStore.getState();
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);
}
