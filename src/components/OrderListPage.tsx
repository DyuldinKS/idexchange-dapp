import debug from 'debug';
import { isHexString } from 'ethers/lib/utils.js';
import { FC, useEffect } from 'react';
import { z } from 'zod';

import { Tooltip, Typography } from '@mui/material';

import { APP_CONFIG } from '../app.config';
import { useContractsAttributes } from '../hooks/useContractsAttributes';
import { useRemoteData } from '../hooks/useRemoteData';
import { rData } from '../utils/remoteData';
import { getIdenaOrderListState, IdenaOrderListState } from '../utils/orderList';
import { UiError, UiPage } from './ui';
import { IdenaOrderList } from './IdenaOrderList';

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

export const OrderListPage: FC = () => {
  const [orderListRD, orderListRDM] = useRemoteData<IdenaOrderListState | null>(null);
  const contractsAttrsRD = useContractsAttributes();
  const contractsAttrs = contractsAttrsRD.data;

  useEffect(() => {
    orderListRDM.track(getIdenaOrderListState());
  }, []);

  const renderOrderList = () => {
    if (rData.isNotAsked(orderListRD) || rData.isLoading(orderListRD)) return 'Loading...';
    if (rData.isFailure(orderListRD)) return <UiError err={orderListRD.error} />;
    return orderListRD.data ? null : 'No active orders found.';
  };

  return (
    <UiPage maxWidth="sm">
      <Tooltip title="Active orders">
        <Typography variant="h4" component="h1" fontWeight={400}>
          Active orders
        </Typography>
      </Tooltip>
      <IdenaOrderList orders={orderListRD.data} xdaiContractProps={contractsAttrs && contractsAttrs.xdai}>{renderOrderList()}</IdenaOrderList>
    </UiPage>
  );
};
