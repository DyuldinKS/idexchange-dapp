import { useEffect } from 'react';

export const useInterval = (f: () => void, intervalMs: number) => {
  useEffect(() => {
    const timerId = setInterval(f, intervalMs);
    return () => clearInterval(timerId);
  }, [intervalMs]);
};
