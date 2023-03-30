import { configureChains, createClient } from '@wagmi/core';
import { gnosis } from '@wagmi/core/chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/html';
import { APP_CONFIG } from '../app.config';

export const DEFAULT_CHAIN_ID = gnosis.id;
const projectId = APP_CONFIG.walletConnect.projectId;
const chains = [gnosis];

const { provider } = configureChains(chains, [w3mProvider({ projectId })]);
export const wagmiClient = createClient({
  autoConnect: true,
  connectors: [...w3mConnectors({ chains, version: 1, projectId })],
  provider,
});

export const ethereumClient = new EthereumClient(wagmiClient, chains);
export const web3Modal = new Web3Modal({ projectId }, ethereumClient);

web3Modal.setDefaultChain(gnosis);

export const isChainSupported = (chainId?: number | null) =>
  chainId && (chains.map((c) => c.id) as number[]).includes(chainId);
