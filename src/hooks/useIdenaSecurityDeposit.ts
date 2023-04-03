import debug from 'debug';
import { isAddress } from 'ethers/lib/utils.js';
import { useEffect } from 'react';
import { SecurityDepositType } from '../types/contracts';

import { readIdenaSecurityDeposit } from '../utils/idena';
import { useRemoteData } from './useRemoteData';
import { rData } from '../utils/remoteData';

const log = debug('hooks:useIdenaSecurityDeposit');

export const useIdenaSecurityDeposit = (idenaAddress: string) => {
  const rd = useRemoteData<SecurityDepositType>(null, log);
  const [, rdMethods] = rd;

  useEffect(() => {
    if (!idenaAddress || !isAddress(idenaAddress)) {
      if (rData.isNotAsked(rdMethods.getState())) return;
      return rdMethods.setNotAsked();
    }
    rdMethods.track(readIdenaSecurityDeposit(idenaAddress));
  }, [idenaAddress, rdMethods]);

  return rd;
};
