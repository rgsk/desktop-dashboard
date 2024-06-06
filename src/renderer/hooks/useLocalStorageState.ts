import { addSeconds } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import useRunOnWindowFocus from './useRunOnWindowFocus';
import useStateRef from './useStateRef';

export const localStorageWithExpiry = {
  getItem<T>(key: string) {
    if (typeof window !== 'undefined') {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      const details = JSON.parse(item);
      // currently we don't delete the item from localStorage after expiration
      // we just don't return it
      if (
        !details.expirationTimestamp ||
        new Date() < new Date(details.expirationTimestamp)
      ) {
        return details.value as T;
      }
      return null;
    }
    return null;
  },
  setItem<T>(key: string, value: T, expirationTimestamp?: Date) {
    if (typeof window !== 'undefined') {
      const details = { value, expirationTimestamp };
      window.localStorage.setItem(key, JSON.stringify(details));
    }
  },
  getExpirationTimestamp: (expirationTime?: number) => {
    return typeof expirationTime === 'number'
      ? addSeconds(new Date(), expirationTime)
      : undefined;
  },
};

// expirationTime in seconds
const useLocalStorageState = <T>(
  key: string,
  initialValue: T,
  expirationTime?: number,
) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(initialValue);

  const [statePopulated, setStatePopulated] = useState(false);

  const initialValueRef = useStateRef(initialValue);

  const populateStateFromLocalStorage = useCallback(() => {
    // Get from local storage by key
    const value = localStorageWithExpiry.getItem<T>(key);
    if (value === null) {
      localStorageWithExpiry.setItem(
        key,
        initialValueRef.current,
        localStorageWithExpiry.getExpirationTimestamp(expirationTime),
      );
      setStoredValue(initialValueRef.current);
    } else {
      setStoredValue(value);
    }
    setStatePopulated(true);
  }, [expirationTime, initialValueRef, key]);

  useEffect(() => {
    populateStateFromLocalStorage();
  }, [populateStateFromLocalStorage]);

  // below takes care of populating the state if user loggedin in another tab and
  // then when he comes back on this tab
  useRunOnWindowFocus(populateStateFromLocalStorage);

  const storedValueRef = useStateRef(storedValue);
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback(
    (valueOrFunction: T | ((prev: T) => T), customExpirationTime?: number) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          valueOrFunction instanceof Function
            ? valueOrFunction(storedValueRef.current)
            : valueOrFunction;
        // Save state
        setStoredValue(valueToStore);
        // Save to local storage
        localStorageWithExpiry.setItem(
          key,
          valueToStore,
          localStorageWithExpiry.getExpirationTimestamp(
            customExpirationTime ?? expirationTime,
          ),
        );
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.log(error);
      }
    },
    [expirationTime, key, storedValueRef],
  );
  return [
    storedValue,
    setValue,
    { statePopulated, refresh: populateStateFromLocalStorage },
  ] as const;
};

export default useLocalStorageState;
