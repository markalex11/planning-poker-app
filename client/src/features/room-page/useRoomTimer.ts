import { useEffect } from 'react';
import { useRoomStore } from '../../store/useRoomStore';

export function useRoomTimer() {
  const { timerStart, timerDuration, setTimeLeft } = useRoomStore();

  useEffect(() => {
    if (!timerStart || !timerDuration) return;

    const interval = setInterval(() => {
      const secondsLeft = Math.max(
        0,
        Math.ceil((timerDuration * 1000 - (Date.now() - timerStart)) / 1000)
      );
      setTimeLeft(secondsLeft);
      if (secondsLeft <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStart, timerDuration, setTimeLeft]);
}
