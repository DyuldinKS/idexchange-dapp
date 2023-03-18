import { createContext, Dispatch, SetStateAction, useCallback, useContext, useState } from 'react';
import debug from 'debug';
import { initialWeb3Store } from './web3';
import { FCC } from '../../types/FCC';

type StoreType = typeof initialStore;
type StoreCtxType = [StoreType, Dispatch<React.SetStateAction<StoreType>>];
type SetStateParameter<StateType> = Parameters<Dispatch<SetStateAction<StateType>>>[0];

const log = debug('providers:StoreProvider');

const initialStore = {
  web3: initialWeb3Store,
};
const StoreCtx = createContext<StoreCtxType>([initialStore, () => {}]);

export const StoreProvider: FCC = ({ children }) => {
  const value = useState(initialStore);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
};

const makeUseStore = <P extends any>(
  getter: (s: StoreType) => P,
  reducer: (s: StoreType, newVal: SetStateParameter<P>) => StoreType,
  key?: string,
) => {
  return () => {
    const [store, setState] = useStore();
    const part = getter(store);

    return [
      part,
      useCallback((newVal) => {
        setState((s) => {
          const actualPart = getter(s);
          const val = typeof newVal === 'function' ? (newVal as any)(actualPart) : newVal;
          log('setStore', key, '\ncurr', actualPart, '\nnew:', val);
          return reducer(s, val);
        });
      }, []),
    ] as [P, (newVal: SetStateParameter<P>) => void];
  };
};

const makeUseStoreByKey = <K extends keyof StoreType>(key: K) =>
  makeUseStore<StoreType[K]>(
    (s) => s[key],
    (s, val) => ({ ...s, [key]: val }),
    key,
  );

export const useStore = () => useContext(StoreCtx);

export const useWeb3Store = makeUseStoreByKey('web3');
