import { gnosis } from '@wagmi/core/chains';
import { addr } from '../utils/address';

export const CONTRACTS = {
  idena: {
    orderCreation: addr('0xdfa64FC435298E3C45bd81491055a597B4CaC98E'),
  },
  [gnosis.id]: {
    responseOrderCreation: addr('0x0000000000000000000000000000000000000001'),
  },
} as const;
