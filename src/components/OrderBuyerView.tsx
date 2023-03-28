import { isAddress } from 'ethers/lib/utils.js';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, TextField } from '@mui/material';

import { useContractsAttributes } from '../hooks/useContractsAttributes';
import { useIdenaSecurityDeposit } from '../hooks/useIdenaSecurityDeposit';
import { UseRemoteDataReturn } from '../hooks/useRemoteData';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { IdenaOrderState } from '../utils/idena';
import { canMatchOrder, isCnfOrderValid } from '../utils/orderControls';
import { rData, RemoteData } from '../utils/remoteData';
import { XdaiConfirmedOrder } from '../utils/xdai';
import { ConfirmedOrderInfoBlock } from './ConfirmedOrderInfo';
import { IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { IdenaSecurityDeposit } from './IdenaSecurityDeposit';
import { UiError, UiSpan, UiSubmitButton } from './ui';
import { renderWalletRoutineIfNeeded } from './WalletRoutine';

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

  const renderOrder = () => {
    if (rData.isNotAsked(orderRD) || rData.isLoading(orderRD) || !contractsAttrs)
      return 'Loading...';
    if (rData.isFailure(orderRD)) return <UiError err={orderRD.error} />;

    if (!order) return 'Order not found.';

    if (canMatchOrder(order, cnfOrder, contractsAttrs.idena)) {
      return <UiSubmitButton onClick={() => {}}>Match order</UiSubmitButton>;
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
