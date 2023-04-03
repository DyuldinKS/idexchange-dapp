import { Transaction } from 'idena-sdk-js';
import { tap } from 'ramda';
import { FC } from 'react';

import { Link, Stack, Typography, useTheme } from '@mui/material';
import { waitForTransaction } from '@wagmi/core';

import { useContractsAttributes } from '../hooks/useContractsAttributes';
import { useRemoteData, UseRemoteDataReturn } from '../hooks/useRemoteData';
import { useXdaiSecurityDeposit } from '../hooks/useXdaiSecurityDeposit';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { isAddrEqual } from '../utils/address';
import { mapRejected } from '../utils/async';
import {
  buildBurnIdenaOrderTx,
  getIdenaLinkToSignTx,
  IdenaOrderState,
  openIdenaAppToSignTx,
  readIdenaOrderState,
} from '../utils/idena';
import { canCancelCnfOrder, canCancelOrder, canCreateCnfOrder } from '../utils/orderControls';
import { rData, RemoteData } from '../utils/remoteData';
import { getColor } from '../utils/theme';
import { burnXdaiOrder, readXdaiCnfOrder, XdaiConfirmedOrder } from '../utils/xdai';
import CnfOrderCompletion from './CnfOrderCompletion';
import { CnfOrderStatusChip, ConfirmedOrderInfoBlock } from './ConfirmedOrderInfo';
import { IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { UiError, UiSpan, UiSubmitButton } from './ui';
import { renderWalletRoutineIfNeeded } from './WalletRoutine';
import { XdaiOrderConfirmation } from './XdaiOrderConfirmation';
import { XdaiSecurityDepositControls, XdaiSecurityDepositOwnerView } from './XdaiSecurityDeposit';

export const OrderOwnerView: FC<{
  secretHash: string;
  orderRD: RemoteData<IdenaOrderState | null>;
  orderRDM: UseRemoteDataReturn<IdenaOrderState | null>[1];
  cnfOrderRD: RemoteData<XdaiConfirmedOrder | null>;
  cnfOrderRDM: UseRemoteDataReturn<XdaiConfirmedOrder | null>[1];
}> = ({ secretHash, orderRD, orderRDM, cnfOrderRD, cnfOrderRDM }) => {
  const [web3Store] = useWeb3Store();
  const [securityDepositRD, securityDepositRDM] = useXdaiSecurityDeposit();
  const order = orderRD.data;
  const [cancelOrderTxRD, cancelOrderTxRDM] = useRemoteData<Transaction>(null);
  const [burnConfirmedOrderRD, burnConfirmedOrderRDM] = useRemoteData(null);
  const contractsAttrsRD = useContractsAttributes();
  const contractsAttrs = contractsAttrsRD.data;

  const canConfirmOrder =
    contractsAttrs && canCreateCnfOrder(order, cnfOrderRD.data, contractsAttrs?.idena);

  const canCancelIdenaOrder =
    contractsAttrs && canCancelOrder(order, cnfOrderRD.data, contractsAttrs?.idena);

  const theme = useTheme();
  // TODO: get owner from events in case of order already burned, but confirmed order is still exists.

  const renderOrder = () => {
    if (rData.isNotAsked(orderRD) || rData.isLoading(orderRD)) return 'Loading...';
    if (rData.isFailure(orderRD)) return <UiError err={orderRD.error} />;

    const order = orderRD.data;
    if (!order) return 'The order has already been completed, cancelled, or never existed.';

    const buildCancelTxAndSign = async () => {
      cancelOrderTxRDM.track(
        buildBurnIdenaOrderTx(order.owner, secretHash).then(tap(openIdenaAppToSignTx)),
      );
    };

    const reloadOrderState = async () => {
      orderRDM.track(
        readIdenaOrderState(secretHash).catch(
          mapRejected((err: any) => {
            console.error('Failed to load order state:', err);
            return err;
          }),
        ),
      );
    };

    return (
      <Stack spacing={2}>
        {!rData.isSuccess(cancelOrderTxRD) && (
          <UiSubmitButton disabled={!canCancelIdenaOrder} onClick={buildCancelTxAndSign}>
            Cancel order
          </UiSubmitButton>
        )}
        {rData.isSuccess(cancelOrderTxRD) && (
          <>
            <Typography color={getColor.textGrey(theme)}>
              Click{' '}
              <Link href={getIdenaLinkToSignTx(cancelOrderTxRD.data)} target="_blank">
                this link
              </Link>{' '}
              if Idena App did not open automatically. Wait for the transaction to complete, then
              reload order state.
            </Typography>
            <UiSubmitButton sx={{ mt: 2 }} onClick={reloadOrderState}>
              Check order status
            </UiSubmitButton>
          </>
        )}
        {rData.isFailure(cancelOrderTxRD) && <UiError err={cancelOrderTxRD.error} />}
      </Stack>
    );
  };

  const reloadCnfOrder = () => cnfOrderRDM.track(readXdaiCnfOrder(secretHash));

  const renderConfirmedOrder = () => {
    if (rData.isNotAsked(cnfOrderRD) || rData.isLoading(cnfOrderRD)) return 'Loading...';
    if (rData.isFailure(cnfOrderRD)) return <UiError err={cnfOrderRD.error} />;

    const cnfOrder = cnfOrderRD.data;
    if (!cnfOrder)
      return 'The confirmation order has already been completed, cancelled, or never existed.';
    if (!isAddrEqual(web3Store.address || '', cnfOrder.owner))
      return (
        <UiError
          msg={
            <UiSpan>
              You are not an owner of this order. Switch account to{' '}
              <UiSpan fontWeight={600}>{cnfOrder.owner}</UiSpan>
            </UiSpan>
          }
        />
      );

    const burnConfirmedOrder = async () => {
      await burnConfirmedOrderRDM.track(
        burnXdaiOrder(secretHash).then((tx) => waitForTransaction({ hash: tx.hash })),
      );
      await reloadCnfOrder();
    };

    return (
      <Stack spacing={2}>
        <UiSubmitButton
          disabled={rData.isLoading(burnConfirmedOrderRD) || !canCancelCnfOrder(cnfOrder)}
          onClick={burnConfirmedOrder}
        >
          Cancel order
        </UiSubmitButton>
        {cnfOrder.matcher && <CnfOrderCompletion cnfOrder={cnfOrder} onComplete={reloadCnfOrder} />}
        <UiError err={burnConfirmedOrderRD.error} />
      </Stack>
    );
  };

  // TODO: handle contract attributes loading and
  if (!contractsAttrs) return null;

  return (
    <Stack alignItems="stretch" mt={4}>
      <Stack spacing={2}>
        <IdenaOrderInfoBlock title="Idena chain" order={orderRD.data} secretHash={secretHash}>
          {renderOrder()}
        </IdenaOrderInfoBlock>
        {renderWalletRoutineIfNeeded(web3Store) ||
          (canConfirmOrder && rData.isSuccess(cnfOrderRD) ? (
            <Stack alignItems="stretch" mt={2} spacing={2}>
              <XdaiSecurityDepositOwnerView
                securityDepositRD={securityDepositRD}
                controls={
                  <XdaiSecurityDepositControls
                    address={web3Store.address}
                    securityDepositRD={securityDepositRD}
                    securityDepositRDM={securityDepositRDM}
                  />
                }
              />
              <XdaiOrderConfirmation
                secretHash={secretHash}
                order={order}
                cnfOrderRD={cnfOrderRD}
                cnfOrderRDM={cnfOrderRDM}
              />
            </Stack>
          ) : (
            <ConfirmedOrderInfoBlock
              statusChip={<CnfOrderStatusChip order={order} cnfOrder={cnfOrderRD.data} />}
              title="Confirmation in Gnosis chain"
              cnfOrder={cnfOrderRD.data}
            >
              {renderConfirmedOrder()}
            </ConfirmedOrderInfoBlock>
          ))}
      </Stack>
    </Stack>
  );
};
