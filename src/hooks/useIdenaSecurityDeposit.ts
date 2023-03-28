import debug from 'debug';
import { isAddress } from 'ethers/lib/utils.js';
import { useEffect } from 'react';

import { readIdenaSecurityDeposit } from '../utils/idena';
import { useRemoteData } from './useRemoteData';

export type IdenaSecurityDepositState = Awaited<ReturnType<typeof readIdenaSecurityDeposit>>;

const log = debug('hooks:useIdenaSecurityDeposit');

export const useIdenaSecurityDeposit = (idenaAddress: string) => {
  const rd = useRemoteData<IdenaSecurityDepositState>(null, log);
  const [, rdMethods] = rd;

  useEffect(() => {
    if (!idenaAddress || !isAddress(idenaAddress)) return;
    rdMethods.track(readIdenaSecurityDeposit(idenaAddress));
  }, [idenaAddress, rdMethods]);

  return rd;
};
