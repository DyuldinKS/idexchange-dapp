import debug from 'debug';
import { isHexString } from 'ethers/lib/utils.js';
import { FC, ReactNode, useEffect, useState } from 'react';
import { z } from 'zod';

import { Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';

import { APP_CONFIG } from '../app.config';
import { useContractsAttributes } from '../hooks/useContractsAttributes';
import { useRemoteData } from '../hooks/useRemoteData';
import { canMatchOrder } from '../utils/orderControls';
import { getIdenaOrderListState, IdenaOrderListState } from '../utils/orderList';
import { rData } from '../utils/remoteData';
import { ShortOrderInfo } from './ShortOrderInfo';
import { UiBlock, UiError } from './ui';

const log = debug('OrderListPage');

export type SecretSchema = z.infer<typeof secretSchema>;

const secretSchema = z.object({
  secret: z.string().refine(
    (val) =>
      // TODO: remove 24 bytes secret
      isHexString(val, 24) || isHexString(val, APP_CONFIG.idena.secretBytesLength),
    {
      message: "The order's secret expected to be a hex string.",
    },
  ),
});

export const OrderList: FC = () => {
  const [orderListRD, orderListRDM] = useRemoteData<IdenaOrderListState>(null);
  const { data: contractsAttrs } = useContractsAttributes();
  const [showOnlyMatchable, setShowOnlyMatchable] = useState(false);

  useEffect(() => {
    orderListRDM.track(getIdenaOrderListState());
  }, []);

  const renderContent = (content: ReactNode) => (
    <Stack>
      <Typography variant="h4" component="h2" fontWeight={400}>
        Orders
      </Typography>
      <Stack mt={2}>{content}</Stack>
    </Stack>
  );
  const uiBlock = (content: ReactNode) => <UiBlock>{content}</UiBlock>;

  if (rData.isNotAsked(orderListRD) || rData.isLoading(orderListRD) || !contractsAttrs)
    return renderContent(uiBlock('Loading...'));
  if (rData.isFailure(orderListRD))
    return renderContent(uiBlock(<UiError err={orderListRD.error} />));

  const orders = orderListRD.data;
  const filteredOrders = showOnlyMatchable
    ? orders.filter((x) => canMatchOrder(x.dnaState, x.xdaiState, contractsAttrs.idena))
    : orders;
  if (filteredOrders.length === 0) return renderContent(uiBlock('No active orders found.'));

  return renderContent(
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={showOnlyMatchable}
            onChange={() => setShowOnlyMatchable((prev) => !prev)}
          />
        }
        label="Show orders available for exchange"
      />
      <Stack spacing={2} mt={1}>
        {filteredOrders.map((x) => (
          <ShortOrderInfo key={x.hash} id={x.hash} dnaState={x.dnaState} xdaiState={x.xdaiState} />
        ))}
      </Stack>
    </>,
  );
};
