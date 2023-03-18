import { getAccount, getNetwork, watchNetwork, watchSigner } from '@wagmi/core';
import debug from 'debug';
import { useEffect } from 'react';
import { equals } from 'ramda';
import { useActualRef } from '../hooks/useActualRef';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { buildNewStore } from '../providers/store/web3';
import { web3Modal } from '../utils/web3modal';

const log = debug('components:WalletConnector');

export const WalletConnector = () => {
  const [web3Store, setWeb3Store] = useWeb3Store();
  const web3StoreRef = useActualRef(web3Store);

  useEffect(() => {
    setWeb3Store(buildNewStore());

    const maybeUpdateWeb3Store = () => {
      const newWeb3 = buildNewStore();
      if (equals(web3StoreRef.current, newWeb3)) return;
      setWeb3Store(newWeb3);
    };

    console.log('use effect');
    const unwatchNetwork = watchNetwork((newNetwork) => {
      const chainId = newNetwork.chain?.id;
      log('network changed:', chainId, newNetwork);
      maybeUpdateWeb3Store();
    });
    const unwatchSigner = watchSigner({}, (signer) => {
      log('signer changed', signer);
      maybeUpdateWeb3Store();
    });

    if (!getAccount().isConnected) {
      web3Modal.openModal();
    }

    return () => {
      unwatchNetwork();
      unwatchSigner();
    };
  }, [web3StoreRef]);

  return null;
};
