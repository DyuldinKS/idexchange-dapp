import { useCallback, useRef } from 'react';

/** Returns react ref, that always stores the actual value (last passed) */
export const useActualRef = <T>(value: T) => {
  const ref = useRef<T>(value);
  ref.current = value;
  return ref;
};

/**
 * Returns a new function that always has the same link,
 * but internally calls the actual (latest) version of the given callback.
 */
export const useImmutableCallback = <Inputs extends any[], Output>(
  cb: (...args: Inputs) => Output,
) => {
  const actualRef = useActualRef(cb);
  return useCallback((...args: Inputs) => actualRef.current(...args), [actualRef]);
};
