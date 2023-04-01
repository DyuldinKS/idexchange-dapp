import dayjs from 'dayjs';
import { formatUnits } from 'ethers/lib/utils.js';
import React, { ReactNode } from 'react';

import { Box, Chip, Stack, useTheme } from '@mui/material';
import { gnosis } from '@wagmi/core/chains';

import { FCC } from '../types/FCC';
import { XdaiConfirmedOrder } from '../utils/xdai';
import { DATE_TIME_FORMAT } from './IdenaOrderInfo';
import { UiBlock, UiBlockTitle, UiInfoBlockContent, UiInfoBlockRow, UiSpan } from './ui';

export const ConfirmedOrderInfoBlock: FCC<{
  title: ReactNode;
  order: XdaiConfirmedOrder | null;
  showFullInfo?: boolean;
  isValid?: boolean;
}> = ({ title, order, isValid, children }) => {
  const { palette } = useTheme();
  return (
    <UiBlock>
      <UiBlockTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box>{title}</Box>
          {isValid ? (
            <Chip variant="outlined" label="Valid" color="success" />
          ) : (
            <Chip variant="outlined" label="Invalid" color="error" />
          )}
        </Stack>
      </UiBlockTitle>
      {order && (
        <UiInfoBlockContent>
          <UiInfoBlockRow label="Owner:" value={String(order.owner)} />
          <UiInfoBlockRow
            label="Amount:"
            value={
              <Box component="span">
                <Box component="span" fontWeight={600}>
                  {formatUnits(order.amountXDAI, gnosis.nativeCurrency.decimals)}
                </Box>{' '}
                xDAI
              </Box>
            }
          />
          <UiInfoBlockRow
            label="Response deadline:"
            value={
              order.matchDeadline ? dayjs(order.matchDeadline).format(DATE_TIME_FORMAT) : 'None'
            }
          />
          <UiInfoBlockRow
            label="xDAI giver:"
            value={
              order.matcher ? (
                <UiSpan color={!isValid ? palette.error.main : palette.secondary.dark}>
                  {order.matcher}
                </UiSpan>
              ) : (
                'None'
              )
            }
          />
          <UiInfoBlockRow
            label="xDAI claim deadline:"
            value={
              order.executionDeadline ? (
                <UiSpan color={!isValid ? palette.error.main : palette.secondary.dark}>
                  {dayjs(order.executionDeadline).format(DATE_TIME_FORMAT)}
                </UiSpan>
              ) : (
                'None'
              )
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
