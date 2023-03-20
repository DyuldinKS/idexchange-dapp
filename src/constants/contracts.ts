import { gnosis } from '@wagmi/core/chains';
import { addr } from '../utils/address';

export const CONTRACTS = {
  idena: {
    sellIdna: addr('0xdfa64FC435298E3C45bd81491055a597B4CaC98E'),
  },
  [gnosis.id]: {
    receiveXdai: addr('0x426b466Af327E53B4c2a7D1Ea7672E397BE7b408'),
  },
} as const;
