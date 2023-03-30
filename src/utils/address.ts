import { Address } from '@wagmi/core';
import { isAddress } from 'ethers/lib/utils.js';

export const isAddrEqual = (address1: string, address2: string) =>
  isAddress(address1) && address1.toLowerCase() === address2.toLowerCase();

export const addr = (address: string) => address.toLowerCase() as Address;

export const shortenHash = (hash: string, startLength = 5, endLength = 4): string =>
  `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`;

export const ZERO_ADDRESS = '0x' + '0'.repeat(40);
