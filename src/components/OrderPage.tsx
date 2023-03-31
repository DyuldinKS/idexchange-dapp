import debug from 'debug';
import { isHexString } from 'ethers/lib/utils.js';
import { FC, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { Box, Button, Grid, Stack, Typography, useTheme } from '@mui/material';

import { APP_CONFIG } from '../app.config';
import { useActualRef } from '../hooks/useActualRef';
import { useContractsAttributes } from '../hooks/useContractsAttributes';
import { useInterval } from '../hooks/useInterval';
import { useRemoteData, UseRemoteDataMethods } from '../hooks/useRemoteData';
import { useRevision } from '../hooks/useRevision';
import { shortenHash } from '../utils/address';
import { IdenaOrderState, readIdenaOrderState } from '../utils/idena';
import { isCnfOrderValid } from '../utils/orderControls';
import { rData } from '../utils/remoteData';
import { getColor } from '../utils/theme';
import { readXdaiCnfOrder, XdaiConfirmedOrder } from '../utils/xdai';
import { ConfirmedOrderInfoBlock } from './ConfirmedOrderInfo';
import { IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { OrderBuyerView } from './OrderBuyerView';
import { OrderOwnerView } from './OrderOwnerView';
import { UiError, UiPage } from './ui';

const log = debug('OrderPage');
const logOrderRD = (...args: any[]) => log('orderRD', ...args);
const logCnfOrderRD = (...args: any[]) => log('cnfOrderRD', ...args);

export type SecretSchema = z.infer<typeof secretSchema>;

const secretSchema = z.object({
  secret: z.string().refine((val) => isHexString(val, APP_CONFIG.idena.secretBytesLength), {
    message: "The order's secret expected to be a hex string.",
  }),
});

const useOrderAutoUpdate = (
  hash: string,
  orderRDM: UseRemoteDataMethods<IdenaOrderState | null>,
  cnfOrderRDM: UseRemoteDataMethods<XdaiConfirmedOrder | null>,
) => {
  const hashRef = useActualRef(hash);
  useInterval(() => {
    // if the order doesn't exist (not found, completed or cancelled) stop reloading.
    if (!orderRDM.getState().data && !cnfOrderRDM.getState().data) return;

    readIdenaOrderState(hashRef.current).then((maybeNewState) => {
      if (JSON.stringify(maybeNewState) !== JSON.stringify(orderRDM.getState().data)) {
        log('useOrderAutoUpdate order auto-update');
        orderRDM.setSuccess(maybeNewState);
      }
    });
    readXdaiCnfOrder(hash).then((maybeNewState) => {
      if (JSON.stringify(maybeNewState) !== JSON.stringify(cnfOrderRDM.getState().data)) {
        log('useOrderAutoUpdate cnf order auto-update');
        cnfOrderRDM.setSuccess(maybeNewState);
      }
    });
  }, APP_CONFIG.orderPageStateReloadIntevalMs);
};

export const OrderPage: FC = () => {
  const { hash } = useParams() as { hash: string };
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderRD, orderRDM] = useRemoteData<IdenaOrderState | null>(null, logOrderRD);
  const [cnfOrderRD, cnfOrderRDM] = useRemoteData<XdaiConfirmedOrder | null>(null, logCnfOrderRD);
  const contractsAttrsRD = useContractsAttributes();
  const contractsAttrs = contractsAttrsRD.data;

  const theme = useTheme();

  const viewAs = searchParams.get('viewAs');
  const [, rerender] = useRevision();
  useEffect(rerender, [viewAs]);
  const isOwner = viewAs === 'owner';
  const isBuyer = viewAs === 'buyer';

  useEffect(() => {
    orderRDM.track(readIdenaOrderState(hash));
    cnfOrderRDM.track(readXdaiCnfOrder(hash));
  }, [hash]);

  useOrderAutoUpdate(hash, orderRDM, cnfOrderRDM);

  const renderOrder = () => {
    if (rData.isNotAsked(orderRD) || rData.isLoading(orderRD)) return 'Loading...';
    if (rData.isFailure(orderRD)) return <UiError err={orderRD.error} />;
    return orderRD.data
      ? null
      : 'The order has already been completed, cancelled, or never existed.';
  };

  const renderConfirmedOrder = () => {
    const error = cnfOrderRD.error || contractsAttrsRD.error;
    if (
      rData.isNotAsked(cnfOrderRD) ||
      rData.isLoading(cnfOrderRD) ||
      rData.isLoading(contractsAttrsRD)
    )
      return 'Loading...';
    if (error) return <UiError err={error} />;

    return cnfOrderRD.data
      ? null
      : 'The confirmation order has already been completed, cancelled, or never existed.';
  };

  return (
    <UiPage maxWidth="sm">
      <Link to={`/order/${hash}`}>
        <Typography color={getColor.textLink(theme)} variant="h4" component="h1" fontWeight={400}>
          {`Order ${shortenHash(hash, 6, 5)}`}
        </Typography>
      </Link>
      {(isOwner && (
        <OrderOwnerView
          secretHash={hash}
          orderRD={orderRD}
          orderRDM={orderRDM}
          cnfOrderRD={cnfOrderRD}
          cnfOrderRDM={cnfOrderRDM}
        />
      )) ||
        (isBuyer && (
          <OrderBuyerView
            secretHash={hash}
            orderRD={orderRD}
            orderRDM={orderRDM}
            cnfOrderRD={cnfOrderRD}
            cnfOrderRDM={cnfOrderRDM}
          />
        )) || (
          <Stack mt={4}>
            <Stack spacing={2}>
              <IdenaOrderInfoBlock title="Idena chain" order={orderRD.data} secretHash={hash}>
                {renderOrder()}
              </IdenaOrderInfoBlock>
              <ConfirmedOrderInfoBlock
                isValid={
                  contractsAttrs &&
                  isCnfOrderValid(orderRD.data, cnfOrderRD.data, contractsAttrs.xdai)
                }
                title="Confirmation in Gnosis chain"
                order={cnfOrderRD.data}
              >
                {renderConfirmedOrder()}
              </ConfirmedOrderInfoBlock>
            </Stack>
            {(orderRD.data || cnfOrderRD.data) && (
              <Stack mt={2} spacing={2}>
                <Box>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        size="large"
                        variant="outlined"
                        onClick={() => {
                          setSearchParams(new URLSearchParams({ viewAs: 'owner' }));
                        }}
                      >
                        Manage as owner
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        size="large"
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          setSearchParams(new URLSearchParams({ viewAs: 'buyer' }));
                        }}
                      >
                        {orderRD.data?.matcher ? 'Manage as iDNA buyer' : 'Buy iDNA'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            )}
          </Stack>
        )}
    </UiPage>
  );
};
