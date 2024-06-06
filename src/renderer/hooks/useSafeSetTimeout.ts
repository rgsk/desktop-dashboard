import { useCallback, useEffect, useRef } from 'react';

type Timeout = ReturnType<typeof setTimeout>;

function useSafeSetTimeout() {
  const timeoutRefs = useRef<Timeout[]>([]);

  const setSafeTimeout = useCallback(
    (callback: () => void, delay: number): Timeout => {
      const timout: Timeout = setTimeout(() => {
        if (callback && typeof callback === 'function') {
          callback();
        }
      }, delay);

      timeoutRefs.current.push(timout);
      return timout;
    },
    [],
  );

  const clearSafeTimeout = useCallback((timout: Timeout | null) => {
    if (timout) {
      clearTimeout(timout);
      timeoutRefs.current = timeoutRefs.current.filter((t) => t !== timout);
    }
  }, []);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timout) => {
        clearTimeout(timout);
      });
    };
  }, []);

  return { setSafeTimeout, clearSafeTimeout };
}

export default useSafeSetTimeout;
