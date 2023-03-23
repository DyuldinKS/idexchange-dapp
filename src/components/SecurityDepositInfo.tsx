import { formatUnits } from 'ethers/lib/utils.js';

import { Box, Stack, Tooltip, Typography, TypographyProps, useTheme } from '@mui/material';
import { gnosis } from '@wagmi/core/chains';

import { SecurityDepositInfoType } from '../hooks/useSecurityDepositInfo';
import { FC, ReactNode } from 'react';
import { UiBlock, UiInfoBlockContent, UiInfoBlockRow, UiInputTooltipBtn } from './ui';
import { FCC } from '../types/FCC';
import { StackProps } from '@mui/system';

export const SecurityDepositInfoBlock: FCC<Pick<SecurityDepositInfoType, 'amount' | 'isInUse'>> = ({
  amount,
  isInUse,
  children,
}) => {
  return (
    <UiBlock alignItems="start">
      <Typography variant="h3" fontSize="1.125rem" display="flex" alignItems="center">
        Security deposit
        <UiInputTooltipBtn ml={1}>?</UiInputTooltipBtn>
      </Typography>
      <UiInfoBlockContent mt={2}>
        <UiInfoBlockRow
          title="Current security deposit:"
          value={`${formatUnits(amount, gnosis.nativeCurrency.decimals)} xDAI`}
        />
        {isInUse && (
          <Typography color="error">
            This deposit is already being used to confirm another order. You have to wait until your
            previous order is complete or use a different account to create a new order.
          </Typography>
        )}
      </UiInfoBlockContent>
      <Stack mt={2} alignItems="stretch">
        {children}
      </Stack>
    </UiBlock>
  );
};
