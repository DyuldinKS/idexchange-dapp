import { gnosis } from '@wagmi/core/chains';
import { addr } from '../utils/address';

export const CONTRACTS = {
  idena: {
    sellIdna: addr('0xE23369534EfBfbc1E51f028DAe5f412CCCe1ccA9'),
  },
  [gnosis.id]: {
    receiveXdai: addr('0x426b466Af327E53B4c2a7D1Ea7672E397BE7b408'),
  },
} as const;
