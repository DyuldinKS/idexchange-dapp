import { isAddress } from 'ethers/lib/utils.js';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Stack, TextField, Typography, useTheme } from '@mui/material';

import { useContractsAttributes } from '../hooks/useContractsAttributes';
import { useIdenaSecurityDeposit } from '../hooks/useIdenaSecurityDeposit';
import { useRemoteData, UseRemoteDataReturn } from '../hooks/useRemoteData';
import { useWeb3Store } from '../providers/store/StoreProvider';
import {
  buildMatchIdenaOrderTx,
  getIdenaLinkToSignTx,
  readIdenaOrderState,
  IdenaOrderState,
  openIdenaAppToSignTx,
} from '../utils/idena';
import { canMatchOrder, isCnfOrderValid } from '../utils/orderControls';
import { rData, RemoteData } from '../utils/remoteData';
import { XdaiConfirmedOrder } from '../utils/xdai';
import { ConfirmedOrderInfoBlock } from './ConfirmedOrderInfo';
import { IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { IdenaSecurityDeposit } from './IdenaSecurityDeposit';
import { UiError, UiSpan, UiSubmitButton } from './ui';
import { renderWalletRoutineIfNeeded } from './WalletRoutine';
import { Transaction } from 'idena-sdk-js';
import { getColor } from '../utils/theme';

export type AddressSchema = z.infer<typeof addressSchema>;

const addressSchema = z.object({
  address: z.string().refine((val) => isAddress(val), {
    message: 'Invalid Idena address.',
  }),
});

export const OrderBuyerView: FC<{
  secretHash: string;
  orderRD: RemoteData<IdenaOrderState | null>;
  orderRDM: UseRemoteDataReturn<IdenaOrderState | null>[1];
  cnfOrderRD: RemoteData<XdaiConfirmedOrder | null>;
  cnfOrderRDM: UseRemoteDataReturn<XdaiConfirmedOrder | null>[1];
}> = ({ secretHash, orderRD, orderRDM, cnfOrderRD, cnfOrderRDM }) => {
  const [web3Store] = useWeb3Store();
  const contractsAttrsRD = useContractsAttributes();
  const contractsAttrs = contractsAttrsRD.data;
  const order = orderRD.data;
  const cnfOrder = cnfOrderRD.data;
  const [matchIdenaOrderTxRD, matchIdenaOrderTxRDM] = useRemoteData<Transaction>(null);

  const form = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    defaultValues: { address: '' },
    mode: 'onChange',
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = form;

  const address = watch('address');
  const [securityDepositRD, securityDepositRDM] = useIdenaSecurityDeposit(address);

  const theme = useTheme();

  const renderOrder = () => {
    if (rData.isNotAsked(orderRD) || rData.isLoading(orderRD) || !contractsAttrs)
      return 'Loading...';
    if (rData.isFailure(orderRD)) return <UiError err={orderRD.error} />;

    if (!order) return 'Order not found.';

    const buildMatchOrderTx = async (
      evt: React.BaseSyntheticEvent,
    ): Promise<Transaction | null> => {
      return new Promise((resolve) => {
        form
          .handleSubmit(({ address }) => {
            const txPromise = buildMatchIdenaOrderTx(address, secretHash);
            matchIdenaOrderTxRDM.track(txPromise);
            resolve(txPromise);
          })(evt)
          .catch((err) => {
            console.warn('buildMatchOrderTx caught', err);
            resolve(null);
          });
      });
    };

    const buildMatchOrderTxAndSign = async (evt: React.BaseSyntheticEvent) => {
      return buildMatchOrderTx(evt).then((tx) => tx && openIdenaAppToSignTx(tx));
    };

    if (!order.matcher) {
      if (!rData.isSuccess(matchIdenaOrderTxRD)) {
        return (
          <UiSubmitButton
            disabled={
              !securityDepositRD.data?.isValid ||
              !canMatchOrder(order, cnfOrder, contractsAttrs.idena)
            }
            onClick={buildMatchOrderTxAndSign}
          >
            Book order
          </UiSubmitButton>
        );
      }

      return (
        // TODO: move to IdenaTxLinkRoutine component
        <>
          <Typography color={getColor.textGrey(theme)}>
            Click{' '}
            <Link href={getIdenaLinkToSignTx(matchIdenaOrderTxRD.data)} target="_blank">
              this link
            </Link>{' '}
            if Idena App did not open automatically. Wait for the transaction to complete, then
            reload order state.
          </Typography>
          <UiSubmitButton
            sx={{ mt: 2 }}
            onClick={() => {
              orderRDM.track(readIdenaOrderState(secretHash));
            }}
          >
            Reload order
          </UiSubmitButton>
        </>
      );
    }

    return null;
  };

  const renderConfirmedOrder = () => {
    if (rData.isNotAsked(cnfOrderRD) || rData.isLoading(cnfOrderRD) || !contractsAttrs)
      return 'Loading...';
    if (rData.isFailure(cnfOrderRD)) return <UiError err={cnfOrderRD.error} />;

    if (!cnfOrder) return 'Order confirmation not found.';
    if (cnfOrder.matcher && web3Store.address !== cnfOrder.matcher)
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

    return null;
  };

  return (
    <Stack alignItems="stretch" mt={4}>
      <Stack spacing={2}>
        <TextField
          {...register('address')}
          error={Boolean(errors.address)}
          helperText={errors.address?.message}
          placeholder="Your Idena address"
          fullWidth
          size="small"
        />
        <IdenaSecurityDeposit
          securityDepositRD={securityDepositRD}
          securityDepositRDM={securityDepositRDM}
          form={form}
        />
        <IdenaOrderInfoBlock title="Idena chain" order={orderRD.data} secretHash={secretHash}>
          {renderOrder()}
        </IdenaOrderInfoBlock>
        {renderWalletRoutineIfNeeded(web3Store) || (
          <ConfirmedOrderInfoBlock
            isValid={
              contractsAttrs && isCnfOrderValid(orderRD.data, cnfOrderRD.data, contractsAttrs.xdai)
            }
            title="Confirmation in Gnosis chain"
            order={cnfOrderRD.data}
          >
            {renderConfirmedOrder()}
          </ConfirmedOrderInfoBlock>
        )}
      </Stack>
    </Stack>
  );
};
