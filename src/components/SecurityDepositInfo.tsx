import { formatUnits } from 'ethers/lib/utils.js';

import { Stack } from '@mui/material';
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
      {title || <UiBlockTitle tooltip="The existence of a deposit incentivizes the seller to fulfill their obligation in the transaction. For instance, if a seller confirms an order on Gnosis network, someone matches that order by locking XDAI for the seller to claim, and then a seller fails to reveal the secret on Gnosis network, seller' security deposit will be seized in the following manner: 50% to the mather to compensate seized security deposit on Idena network and 50% to the protocol fund."
      >Security deposit
      </UiBlockTitle>}
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
