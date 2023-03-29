import { formatUnits } from 'ethers/lib/utils.js';

import { Stack, Typography } from '@mui/material';
import { Chain } from '@wagmi/core/chains';

import React from 'react';
import { SecurityDepositType } from '../types/contracts';
import { FCC } from '../types/FCC';
import { UiBlock, UiBlockTitle, UiInfoBlockContent, UiInfoBlockRow } from './ui';

export const SecurityDepositInfoBlock: FCC<{
  securityDeposit: Pick<SecurityDepositType, 'amount' | 'isInUse'> | null;
  nativeCurrency: Chain['nativeCurrency'];
}> = ({ securityDeposit, nativeCurrency, children }) => {
  return (
    <UiBlock alignItems="start">
      <UiBlockTitle>Security deposit</UiBlockTitle>
      {securityDeposit && (
        <UiInfoBlockContent>
          <UiInfoBlockRow
            label="Current security deposit:"
            value={`${formatUnits(securityDeposit.amount, nativeCurrency.decimals)} ${
              nativeCurrency.symbol
            }`}
          />
          {securityDeposit.isInUse && (
            <Typography color="error">
              This deposit is already being used to confirm another order. You have to wait until
              your previous order is complete or use a different account to create a new order.
            </Typography>
          )}
        </UiInfoBlockContent>
      )}
      {React.Children.toArray(children).filter(Boolean).length > 0 && (
        <Stack mt={2} alignItems="stretch">
          {children}
        </Stack>
      )}
    </UiBlock>
  );
};
