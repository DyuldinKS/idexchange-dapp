import { ethers } from 'ethers';
import * as idenaSdk from 'idena-sdk-js';
import { useEffect } from 'react';

import * as wagmi from '@wagmi/core';

import { APP_CONFIG } from '../app.config';
import { useActualRef } from '../hooks/useActualRef';
import { useStore } from '../providers/store/StoreProvider';
import * as idenaHelpers from '../utils/idena';
import * as xdaiHelpers from '../utils/xdai';

export default function DebugTools() {
  const web3Ref = useActualRef({
    ethers,
    wagmi,
    idenaSdk,
    // contract helpers
    ch: {
      idena: idenaHelpers,
      xdai: xdaiHelpers,
    },
  });
  const storeRef = useActualRef(useStore());

  useEffect(() => {
    if (!APP_CONFIG.devMode) return;

    (window as any).dex = {
      APP_CONFIG,
      env: process.env,
      web3: () => web3Ref.current,
      getStore: () => storeRef.current[0],
      setStore: storeRef.current[1],
    };
  }, [web3Ref, storeRef]);

  return null;
}
