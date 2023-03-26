import { switchNetwork } from '@wagmi/core';

import { useWeb3Store } from '../providers/store/StoreProvider';
import { Web3Store } from '../providers/store/web3';
import { DEFAULT_CHAIN_ID, isChainSupported, web3Modal } from '../utils/web3Modal';
import { UiSubmitButton } from './ui';

export const renderWalletRoutineIfNeeded = ({
  chainId,
  address,
}: Pick<Web3Store, 'chainId' | 'address'>) => {
  return (
    (!address && (
      <UiSubmitButton onClick={() => web3Modal.openModal()} variant="contained">
        Connect wallet
      </UiSubmitButton>
    )) ||
    (!isChainSupported(chainId) && (
      <UiSubmitButton onClick={() => switchNetwork({ chainId: DEFAULT_CHAIN_ID })}>
        Switch network
      </UiSubmitButton>
    )) ||
    null
  );
};
