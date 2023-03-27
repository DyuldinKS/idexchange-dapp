import dayjs from 'dayjs';
import { formatUnits } from 'ethers/lib/utils.js';
import React, { ReactNode } from 'react';

import { Box, Chip, Stack } from '@mui/material';
import { gnosis } from '@wagmi/core/chains';

import { FCC } from '../types/FCC';
import { XdaiConfirmedOrder } from '../utils/xdai';
import { DATE_TIME_FORMAT } from './IdenaOrderInfo';
import { UiBlock, UiBlockTitle, UiInfoBlockContent, UiInfoBlockRow } from './ui';

export const ConfirmedOrderInfoBlock: FCC<{
  title: ReactNode;
  order: XdaiConfirmedOrder | null;
  showFullInfo?: boolean;
  isValid?: boolean | null;
}> = ({ title, order, showFullInfo, isValid, children }) => {
  return (
    <UiBlock>
      <UiBlockTitle>
        {isValid == null ? (
          title
        ) : (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box>{title}</Box>
            {isValid ? (
              <Chip variant="outlined" label="Valid" color="info" />
            ) : (
              <Chip variant="outlined" label="Invalid" color="error" />
            )}
          </Stack>
        )}
      </UiBlockTitle>
      {order && (
        <UiInfoBlockContent>
          <UiInfoBlockRow title="Owner:" value={String(order.owner)} />
          <UiInfoBlockRow
            title="Amount:"
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
            title="Response deadline:"
            value={
              order.matchDeadline ? dayjs(order.matchDeadline).format(DATE_TIME_FORMAT) : 'None'
            }
          />
          <UiInfoBlockRow title="Matcher:" value={order.matcher || 'None'} />
          <UiInfoBlockRow
            title="xDAI depositing deadline:"
            value={
              order.executionDeadline
                ? dayjs(order.executionDeadline).format(DATE_TIME_FORMAT)
                : 'None'
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
