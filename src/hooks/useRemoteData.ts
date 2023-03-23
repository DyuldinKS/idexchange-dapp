import React, { useRef, useState } from 'react';
import { rData, RemoteData } from '../utils/remoteData';

type UseRemoteDataApi<SuccessData, InitialData = null, Err = any> = {
  getState: () => RemoteData<SuccessData, InitialData, Err>;
  setState: React.Dispatch<React.SetStateAction<RemoteData<SuccessData, InitialData, Err>>>;
  setNotAsked: (data?: InitialData) => void;
  setLoading: (data?: InitialData) => void;
  setSuccess: (data: SuccessData) => void;
  setFailure: (error: Err, data?: InitialData) => void;
  track: (promise: Promise<SuccessData>) => Promise<SuccessData | void>;
};

export type UseRemoteDataReturn<SuccessData, InitialData = null, Err = any> = [
  rData: RemoteData<SuccessData, InitialData, Err>,
  api: UseRemoteDataApi<SuccessData, InitialData, Err>,
];

/**
 * A hook that bounds RemoteData state and its updates to React state.
 * @param initialState - initial state of the RemoteData
 * @param log - a function to log changes of the RemoteData state.
 * @returns a tuple consisting of the RemoteData itself and the immutable object,
 * representing the set of methods to control the RemoteData state.
 * The methods object is immutable - it is always the same object in memory,
 * while the methods themselves are re-created on every render.
 */
export const useRemoteData = <SuccessData, InitialData = null, Err = any>(
  initialState: InitialData,
  log?: (...args: any[]) => void,
): UseRemoteDataReturn<SuccessData, InitialData, Err> => {
  const [state, setState] = useState<RemoteData<SuccessData, InitialData, Err>>(
    rData.makeNotAsked(initialState),
  );

  const getState = () => state;

  const setNotAsked = (newState = initialState) => {
    log?.('RD notAsked', newState);
    setState(rData.makeNotAsked(newState));
  };

  const setLoading = (newState = initialState) => {
    log?.('RD loading', newState);
    setState(rData.makeLoading(newState));
  };

  const setSuccess = (newState: SuccessData) => {
    log?.('RD success', newState);
    setState(rData.makeSuccess(newState));
  };

  const setFailure = (err: Err, newState = initialState) => {
    log?.('RD failure', err, newState);
    setState(rData.makeFailure(err, newState));
  };

  const track = (promise: Promise<SuccessData>) => {
    setLoading();
    return promise.then((res) => (setSuccess(res), res)).catch(setFailure);
  };

  const methodsBoundToNewState = {
    getState,
    setState,
    setNotAsked,
    setLoading,
    setSuccess,
    setFailure,
    track,
  } as const;
  const methodsRef = useRef(methodsBoundToNewState);
  // meld new methods into existing object, without changing the link on it
  Object.assign(methodsRef.current, methodsBoundToNewState);

  return [state, methodsRef.current];
};
