import { useEffect, useRef } from 'react';

const useStateRef = <T>(state: T) => {
  const stateRef = useRef(state);
  useEffect(() => {
    // console.log('stateRef.current = state;');
    stateRef.current = state;
  }, [state]);
  return stateRef;
};
export default useStateRef;
