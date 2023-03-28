import { formatUnits } from 'ethers/lib/utils.js';

import { Box, Stack, Tooltip, Typography, TypographyProps, useTheme } from '@mui/material';
import { gnosis } from '@wagmi/core/chains';

import { SecurityDepositInfoType } from '../hooks/useSecurityDepositInfo';
import React, { FC, ReactNode } from 'react';
import { UiBlock, UiBlockTitle, UiInfoBlockContent, UiInfoBlockRow, UiInputTooltipBtn } from './ui';
import { FCC } from '../types/FCC';
import { StackProps } from '@mui/system';

export const SecurityDepositInfoBlock: FCC<Pick<SecurityDepositInfoType, 'amount' | 'isInUse'>> = ({
  amount,
  isInUse,
  children,
}) => {
  return (
    <UiBlock alignItems="start">
      <UiBlockTitle>Security deposit</UiBlockTitle>
      <UiInfoBlockContent>
        <UiInfoBlockRow
          label="Current security deposit:"
          value={`${formatUnits(amount, gnosis.nativeCurrency.decimals)} xDAI`}
        />
        {isInUse && (
          <Typography color="error">
            This deposit is already being used to confirm another order. You have to wait until your
            previous order is complete or use a different account to create a new order.
          </Typography>
        )}
      </UiInfoBlockContent>
      {React.Children.toArray(children).filter(Boolean).length > 0 && (
        <Stack mt={2} alignItems="stretch">
          {children}
        </Stack>
      )}
    </UiBlock>
  );
};
