import { Chain } from '@wagmi/core/chains';

import { BigNumber } from 'ethers';
import { FC, ReactNode } from 'react';
import { FCC } from '../types/FCC';
import { SecurityDepositType } from '../types/contracts';
import {
  UiBlock,
  UiBlockTitle,
  UiInfoBlockContent,
  UiInfoBlockRow,
  UiInfoBlockTokenAmount,
} from './ui';

export const SecurityDepositAmount: FC<{
  amount: BigNumber;
  nativeCurrency: Pick<Chain['nativeCurrency'], 'decimals' | 'symbol'>;
}> = ({ amount, nativeCurrency }) => {
  return (
    <UiInfoBlockRow
      label="Deposited:"
      value={<UiInfoBlockTokenAmount amount={amount} {...nativeCurrency} />}
    />
  );
};
