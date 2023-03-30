import { getNetwork, getAccount, Address } from '@wagmi/core';

export type Web3Store = {
  chainId: number | null;
  address: Address | null;
};

export const buildNewStore = (partialStore?: Partial<Web3Store>) => ({
  chainId: getNetwork().chain?.id || null,
  address: getAccount().address || null,
  ...partialStore,
});

export const initialWeb3Store: Web3Store = buildNewStore();
