import debug from 'debug';
import { BigNumber } from 'ethers';
import { useCallback, useEffect } from 'react';

import { Address, readContract } from '@wagmi/core';

import { useRemoteData } from '../hooks/useRemoteData';
import { useWeb3Store } from '../providers/store/StoreProvider';

export type SecurityDepositInfoType = {
  amount: BigNumber;
  isInUse: Boolean;
  requiredAmount: BigNumber;
  isValid: Boolean;
};

const log = debug('hooks:useSecurityDepositInfo');

export const useGetSecurityDepositInfo = (contractToReceiveTokens: Address, abi: any) => {
  const [{ chainId, address }] = useWeb3Store();
  const rd = useRemoteData<SecurityDepositInfoType>(null, log);
  const [, rdMethods] = rd;

  const reloadSecurityDeposit = useCallback(() => {
    if (!address || !chainId) return;

    const contractInfo = {
      address: contractToReceiveTokens,
      abi,
    };

    const load = Promise.all([
      readContract({
        ...contractInfo,
        functionName: 'securityDeposits',
        args: [address],
      }),
      readContract({
        ...contractInfo,
        functionName: 'securityDepositInUse',
        args: [address],
      }),
      readContract({
        ...contractInfo,
        functionName: 'securityDepositAmount',
        args: [],
      }),
    ]).then(([amount, isInUse, requiredAmount]: any[]) => ({
      amount,
      isInUse,
      requiredAmount,
      isValid: amount.gte(requiredAmount) && !isInUse,
    }));
    rdMethods.track(load);
    return load;
  }, [address, chainId, rdMethods]);

  useEffect(() => {
    reloadSecurityDeposit();
  }, [reloadSecurityDeposit]);

  return { rData: rd, reloadSecurityDeposit } as const;
};
