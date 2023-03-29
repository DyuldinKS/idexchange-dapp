import React from 'react';
import { UiBlock } from './ui';
import { IdenaOrderListState } from '../utils/orderList';
import { Stack } from '@mui/system';
import { XdaiConfirmedOrder, XdaiContractAttributes } from '../utils/xdai';
import { isOrderMatchable } from '../utils/orderControls';
import { IdenaOrderState } from '../utils/idena';
import { FCC } from '../types/FCC';
import { ShortOrderInfo } from './ShortOrderInfo';

export const IdenaOrderList: FCC<{ orders: IdenaOrderListState | null, xdaiContractProps: XdaiContractAttributes | null, currentTimestamp: number }> = ({ orders, children, xdaiContractProps, currentTimestamp }) => {
  const validOrders = orders && xdaiContractProps &&
    (orders as { xdaiState: XdaiConfirmedOrder, dnaState: IdenaOrderState }[])
      .filter(({ xdaiState, dnaState }) => isOrderMatchable(dnaState, xdaiState, xdaiContractProps, currentTimestamp))

  return (
    <UiBlock>
      {
        validOrders &&
        (validOrders as { xdaiState: XdaiConfirmedOrder, dnaState: IdenaOrderState, hash: string }[])
          .map(x =>
            <Stack mt={4}>
              <Stack spacing={2}>
                <ShortOrderInfo
                  id={x.hash} dnaState={x.dnaState} xdaiState={x.xdaiState}>
                </ShortOrderInfo>
              </Stack>
            </Stack>
          )
      }
      {React.Children.toArray(children).filter(Boolean).length > 0 && (
        <Stack mt={2} alignItems="stretch">
          {children}
        </Stack>
      )}
    </UiBlock>
  );
};
