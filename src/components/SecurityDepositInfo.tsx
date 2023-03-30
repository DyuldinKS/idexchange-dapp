import { formatUnits } from 'ethers/lib/utils.js';

import { Stack, Typography } from '@mui/material';
import { Chain } from '@wagmi/core/chains';

import React, { ReactNode } from 'react';
import { SecurityDepositType } from '../types/contracts';
import { FCC } from '../types/FCC';
import { UiBlock, UiBlockTitle, UiInfoBlockContent, UiInfoBlockRow, UiSpan } from './ui';

export const SecurityDepositInfoBlock: FCC<{
  securityDeposit: Pick<SecurityDepositType, 'amount' | 'isInUse'> | null;
  nativeCurrency: Chain['nativeCurrency'];
  description?: ReactNode;
  title?: ReactNode;
}> = ({ securityDeposit, nativeCurrency, title, description, children }) => {
  return (
    <UiBlock alignItems="start">
      {title || <UiBlockTitle>Security deposit</UiBlockTitle>}
      {securityDeposit && (
        <UiInfoBlockContent>
          {description && <UiInfoBlockRow label={description} />}
          <UiInfoBlockRow
            label="Deposited:"
            value={
              <UiSpan>
                <UiSpan fontWeight={600}>
                  {formatUnits(securityDeposit.amount, nativeCurrency.decimals)}
                </UiSpan>{' '}
                {nativeCurrency.symbol}
              </UiSpan>
            }
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
