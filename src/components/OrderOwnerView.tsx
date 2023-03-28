import { Transaction } from 'idena-sdk-js';
import { tap } from 'ramda';
import { FC } from 'react';

import { Link, Stack, Typography, useTheme } from '@mui/material';
import { waitForTransaction } from '@wagmi/core';
import { gnosis } from '@wagmi/core/chains';

import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { CONTRACTS } from '../constants/contracts';
import { useContractsAttributes } from '../hooks/useContractsAttributes';
import { useRemoteData, UseRemoteDataReturn } from '../hooks/useRemoteData';
import { useGetSecurityDepositInfo } from '../hooks/useSecurityDepositInfo';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { mapRejected } from '../utils/async';
import {
  buildBurnIdenaOrderTx,
  getIdenaLinkToSignTx,
  getIdenaOrderState,
  IdenaOrderState,
  openIdenaAppToSignTx,
} from '../utils/idena';
import {
  canCancelCnfOrder,
  isOrderConfirmationValid,
  minTimeForIdena,
} from '../utils/orderControls';
import { rData, RemoteData } from '../utils/remoteData';
import { getColor } from '../utils/theme';
import { burnXdaiOrder, readXdaiConfirmedOrder, XdaiConfirmedOrder } from '../utils/xdai';
import { ConfirmedOrderInfoBlock } from './ConfirmedOrderInfo';
import { IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { SecurityDeposit } from './SecurityDeposit';
import { UiError, UiSpan, UiSubmitButton } from './ui';
import { renderWalletRoutineIfNeeded } from './WalletRoutine';
import { XdaiOrderConfirmation } from './XdaiOrderConfirmation';

export const OrderOwnerView: FC<{
  secretHash: string;
  orderRD: RemoteData<IdenaOrderState | null>;
  orderRDM: UseRemoteDataReturn<IdenaOrderState | null>[1];
  cnfOrderRD: RemoteData<XdaiConfirmedOrder | null>;
  cnfOrderRDM: UseRemoteDataReturn<XdaiConfirmedOrder | null>[1];
}> = ({ secretHash, orderRD, orderRDM, cnfOrderRD, cnfOrderRDM }) => {
  const [web3Store] = useWeb3Store();
  const {
    rData: [securityDepositRD],
    reloadSecurityDeposit,
  } = useGetSecurityDepositInfo(CONTRACTS[gnosis.id].receiveXdai, abiToReceiveXdai);
  const order = orderRD.data;
  // if the order is still without confirmation
  const isConfirmedOrderNotFound = rData.isSuccess(cnfOrderRD) && !cnfOrderRD.data;
  const canConfirmOrder =
    order &&
    // TODO: take into account minOrderTTL <= (idena.expireAt - gnosis.deadline),
    // because there's no need to create confirmation for order that could'n be matched.
    // Should be replaced with: (order.expireAt - gnosis.minOrderTTL > Date.now())
    order.expireAt > Date.now() &&
    isConfirmedOrderNotFound;
  const [cancelOrderTxRD, cancelOrderTxRDM] = useRemoteData<Transaction>(null);
  const [burnConfirmedOrderRD, burnConfirmedOrderRDM] = useRemoteData(null);
  const contractsAttrsRD = useContractsAttributes();
  const contractsAttrs = contractsAttrsRD.data;
  const theme = useTheme();
  // TODO: get owner from events in case of order already burned, but confirmed order is still exists.

  const renderOrder = () => {
    if (rData.isNotAsked(orderRD) || rData.isLoading(orderRD)) return 'Loading...';
    if (rData.isFailure(orderRD)) return <UiError err={orderRD.error} />;

    const order = orderRD.data;
    if (!order) return 'Order not found.';

    const buildCancelTxAndSign = async () => {
      cancelOrderTxRDM.track(
        buildBurnIdenaOrderTx(order.owner, secretHash).then(tap(openIdenaAppToSignTx)),
      );
    };

    const reloadOrderState = async () => {
      orderRDM.track(
        getIdenaOrderState(secretHash).catch(
          mapRejected((err: any) => {
            console.error('Failed to load order state:', err);
            return err;
          }),
        ),
      );
    };

    const canBeCancelled =
      Date.now() > order.expireAt - minTimeForIdena &&
      !cnfOrderRD.data &&
      !rData.isLoading(cancelOrderTxRD);

    return (
      <Stack spacing={2}>
        {!rData.isSuccess(cancelOrderTxRD) && (
          <UiSubmitButton disabled={!canBeCancelled} onClick={buildCancelTxAndSign}>
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

  const renderConfirmedOrder = () => {
    if (rData.isNotAsked(cnfOrderRD) || rData.isLoading(cnfOrderRD)) return 'Loading...';
    if (rData.isFailure(cnfOrderRD)) return <UiError err={cnfOrderRD.error} />;

    const cnfOrder = cnfOrderRD.data;
    if (!cnfOrder) return 'Order confirmation not found.';
    if (web3Store.address !== cnfOrder.owner)
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
      await cnfOrderRDM.track(readXdaiConfirmedOrder(secretHash));
    };

    return (
      <>
        <UiSubmitButton
          disabled={rData.isLoading(burnConfirmedOrderRD) || !canCancelCnfOrder(cnfOrder)}
          onClick={burnConfirmedOrder}
        >
          Cancel order
        </UiSubmitButton>
        <UiError mt={1} err={burnConfirmedOrderRD.error} />
      </>
    );
  };

  return (
    <Stack alignItems="stretch" mt={4}>
      <Stack spacing={2}>
        <IdenaOrderInfoBlock title="Idena chain" order={orderRD.data} secretHash={secretHash}>
          {renderOrder()}
        </IdenaOrderInfoBlock>
        {renderWalletRoutineIfNeeded(web3Store) ||
          (canConfirmOrder ? (
            <Stack alignItems="stretch" mt={2} spacing={2}>
              <SecurityDeposit
                state={securityDepositRD}
                reloadSecurityDeposit={reloadSecurityDeposit}
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
              isValid={
                contractsAttrs &&
                isOrderConfirmationValid(orderRD.data, cnfOrderRD.data, contractsAttrs.xdai)
              }
              title="Confirmation in Gnosis chain"
              order={cnfOrderRD.data}
            >
              {renderConfirmedOrder()}
            </ConfirmedOrderInfoBlock>
          ))}
      </Stack>
    </Stack>
  );
};
