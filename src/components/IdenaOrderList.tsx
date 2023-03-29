import React, { FC } from 'react';
import { UiBlock } from './ui';
import { IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { IdenaOrderListState } from '../utils/orderList';
import { Stack } from '@mui/system';
import { ShortOrderInfoBlock } from './ShortOrderInfo';
import { XdaiContractAttributes } from '../utils/xdai';
import { isOrderConfirmationValid } from '../utils/orderControls';

export const IdenaOrderList: FC<NonNullable<{ orders: IdenaOrderListState | null, xdaiContractProps: XdaiContractAttributes }>> = ({ orders, children, xdaiContractProps }) => {
  const validOrders = orders && orders.filter(x => isOrderConfirmationValid(x.dnaState, x.xdaiState, xdaiContractProps))
  return (
    <UiBlock>
          {validOrders && validOrders.map(x =>
            <Stack mt={4}>
              <Stack spacing={2}>
                <ShortOrderInfoBlock
                  title={x.hash} order={x}>
                </ShortOrderInfoBlock>
              </Stack>
            </Stack>
          )}
      {React.Children.toArray(children).filter(Boolean).length > 0 && (
        <Stack mt={2} alignItems="stretch">
          {children}
        </Stack>
      )}
    </UiBlock>
  );
};
