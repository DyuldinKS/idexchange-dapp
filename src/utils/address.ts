import { Address } from '@wagmi/core';

export const isAddrEqual = (address1: string, address2: string) =>
  address1.toLowerCase() === address2.toLowerCase();

export const addr = (address: string) => address.toLowerCase() as Address;
