import { formatUnits } from 'ethers/lib/utils.js';

import { Stack, Tooltip, Typography } from '@mui/material';
import { gnosis } from '@wagmi/core/chains';

import { SecurityDepositInfoType } from '../hooks/useSecurityDepositInfo';
import { FC } from 'react';

export const SecurityDepositInfo: FC<Pick<SecurityDepositInfoType, 'amount' | 'isInUse'>> = ({
  amount,
  isInUse,
}) => {
  return (
    <Stack alignItems="start">
      <Typography>{`Current security deposit: ${formatUnits(
        amount,
        gnosis.nativeCurrency.decimals,
      )} xDai`}</Typography>
      {amount.gt(0) && (
        <Tooltip
          placement="top-start"
          title={
            <>
              Shows if your deposit is already being used to confirm another order. If it is true,
              you will need to wait until your previous order is complete or use a different account
              to create a new order.
            </>
          }
        >
          <Typography>{`Already in use: ${isInUse} (?)`}</Typography>
        </Tooltip>
      )}
    </Stack>
  );
};
