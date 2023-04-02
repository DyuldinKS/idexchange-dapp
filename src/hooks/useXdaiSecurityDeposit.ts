import debug from 'debug';
import { useEffect } from 'react';

import { useWeb3Store } from '../providers/store/StoreProvider';
import { SecurityDepositType } from '../types/contracts';
import { readXdaiSecurityDeposit } from '../utils/xdai';
import { useContractsAttributes } from './useContractsAttributes';
import { useRemoteData } from './useRemoteData';
import { rData } from '../utils/remoteData';

const log = debug('hooks:useSecurityDepositInfo');

export const useXdaiSecurityDeposit = () => {
  const [{ chainId, address }] = useWeb3Store();
  const { data: contractAttrs } = useContractsAttributes();
  const rd = useRemoteData<SecurityDepositType>(null, log);
  const [, rdMethods] = rd;

  useEffect(() => {
    if (!address || !chainId || !contractAttrs) {
      if (rData.isNotAsked(rdMethods.getState())) return;
      return rdMethods.setNotAsked();
    }

    rdMethods.track(readXdaiSecurityDeposit(address, contractAttrs.xdai));
  }, [address, chainId, contractAttrs, rdMethods]);

  return rd;
};
