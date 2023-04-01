import dayjs from 'dayjs';
import { formatUnits } from 'ethers/lib/utils.js';
import React, { FC, ReactNode } from 'react';

import { Box, Chip, Stack, useTheme } from '@mui/material';
import { gnosis } from '@wagmi/core/chains';

import { FCC } from '../types/FCC';
import { IdenaOrderState } from '../utils/idena';
import { isCnfOrderExecutionExpired, isCnfOrderValid } from '../utils/orderControls';
import { XdaiConfirmedOrder } from '../utils/xdai';
import { DATE_TIME_FORMAT } from './IdenaOrderInfo';
import { UiBlock, UiBlockTitle, UiInfoBlockContent, UiInfoBlockRow, UiSpan } from './ui';

export const CnfOrderStatusChip: FC<{
  order: IdenaOrderState | null;
  cnfOrder: XdaiConfirmedOrder | null;
}> = ({ order, cnfOrder }) => {
  if (!order || !cnfOrder) return null;

  return isCnfOrderValid(order, cnfOrder) ? (
    <Chip variant="outlined" label="Valid" color="success" />
  ) : (
    <Chip variant="outlined" label="Invalid" color="error" />
  );
};

export const ConfirmedOrderInfoBlock: FCC<{
  title: ReactNode;
  cnfOrder: XdaiConfirmedOrder | null;
  statusChip: ReactNode;
}> = ({ title, cnfOrder, statusChip, children }) => {
  const { palette } = useTheme();
  return (
    <UiBlock>
      <UiBlockTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box>{title}</Box>
          {statusChip}
        </Stack>
      </UiBlockTitle>
      {cnfOrder && (
        <UiInfoBlockContent>
          <UiInfoBlockRow label="Owner:" value={String(cnfOrder.owner)} />
          <UiInfoBlockRow
            label="Amount:"
            value={
              <Box component="span">
                <Box component="span" fontWeight={600}>
                  {formatUnits(cnfOrder.amountXDAI, gnosis.nativeCurrency.decimals)}
                </Box>{' '}
                xDAI
              </Box>
            }
          />
          <UiInfoBlockRow
            label="Response deadline:"
            value={dayjs(cnfOrder.matchDeadline).format(DATE_TIME_FORMAT)}
          />
          <UiInfoBlockRow
            label="xDAI giver:"
            value={
              cnfOrder.matcher ? (
                <UiSpan
                  color={
                    isCnfOrderExecutionExpired(cnfOrder)
                      ? palette.error.main
                      : palette.secondary.dark
                  }
                >
                  {cnfOrder.matcher}
                </UiSpan>
              ) : (
                'None'
              )
            }
          />
          <UiInfoBlockRow
            label="xDAI claim deadline:"
            value={
              cnfOrder.executionDeadline ? (
                <UiSpan
                  color={
                    isCnfOrderExecutionExpired(cnfOrder)
                      ? palette.error.main
                      : palette.secondary.dark
                  }
                >
                  {dayjs(cnfOrder.executionDeadline).format(DATE_TIME_FORMAT)}
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
