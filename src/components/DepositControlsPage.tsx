import debug from 'debug';
import { FC, ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useIdenaSecurityDeposit } from '../hooks/useIdenaSecurityDeposit';
import { useXdaiSecurityDeposit } from '../hooks/useXdaiSecurityDeposit';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { IDENA_CHAIN, SecurityDepositType } from '../utils/idena';
import { IDENA_SEC_DEPOSIT_TEXTS, IdenaSecurityDepositControls } from './IdenaSecurityDeposit';
import { AddressSchema, addressSchema } from './OrderBuyerView';
import { renderWalletRoutineIfNeeded } from './WalletRoutine';
import {
  XDAI_SEC_DEPOSIT_TEXTS,
  XdaiSecurityDepositControls,
  XdaiSecurityDepositOwnerView,
} from './XdaiSecurityDeposit';
import { UiBlock, UiBlockTitle, UiError, UiInfoBlockContent, UiInfoBlockRow, UiPage } from './ui';
import { SecurityDepositAmount } from './SecurityDepositInfo';
import { RemoteData } from '../utils/remoteData';
import { gnosis } from '@wagmi/chains';

const log = debug('DepositControlsPage');

export const DepositControlsIdena: FC = () => {
  const form = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    defaultValues: { idenaAddress: '' },
    mode: 'onChange',
  });
  const {
    register,
    formState: { errors },
    watch,
  } = form;

  const idenaAddress = watch('idenaAddress');
  const [securityDepositRD, securityDepositRDM] = useIdenaSecurityDeposit(idenaAddress);
  const error = securityDepositRD.error;
  const { data: securityDeposit } = securityDepositRD;

  return (
    <UiBlock alignItems="start">
      <UiBlockTitle tooltip={IDENA_SEC_DEPOSIT_TEXTS.exclusionExample}>
        iDNA security deposit
      </UiBlockTitle>{' '}
      {securityDeposit && (
        <UiInfoBlockContent>
          <UiInfoBlockRow label="In order to ensure that buyers are trustworthy, the protocol requires them to make one-time security deposit in iDNA." />
          <SecurityDepositAmount
            amount={securityDeposit.amount}
            nativeCurrency={IDENA_CHAIN.nativeCurrency}
          />
        </UiInfoBlockContent>
      )}
      <Stack mt={2} spacing={1}>
        <TextField
          {...register('idenaAddress')}
          error={Boolean(errors.idenaAddress)}
          helperText={errors.idenaAddress?.message}
          placeholder="Idena address"
          fullWidth
          size="small"
        />
        <IdenaSecurityDepositControls
          address={idenaAddress}
          form={form}
          securityDepositRD={securityDepositRD}
          securityDepositRDM={securityDepositRDM}
          allowWithdrawal={true}
        />
        {securityDepositRD.data?.isInUse && (
          <Typography color="error">
            the deposit is already being used for an order booking. You must wait until this order
            is complete before withdrawing.
          </Typography>
        )}
        {error && <UiError err={error} />}
      </Stack>
    </UiBlock>
  );
};

export const DepositControlsXdai: FC<{
  securityDepositRD: RemoteData<SecurityDepositType>;
  controls: ReactNode;
}> = ({ securityDepositRD, controls }) => {
  const error = securityDepositRD.error;
  const securityDeposit = securityDepositRD.data;

  return (
    <UiBlock alignItems="start">
      <UiBlockTitle tooltip={XDAI_SEC_DEPOSIT_TEXTS.exclusionExample}>
        xDAI security deposit
      </UiBlockTitle>
      {securityDeposit && (
        <UiInfoBlockContent>
          {securityDeposit.amount.eq(0) && (
            <UiInfoBlockRow label="The protocol requires a security deposit in xDAI to ensure that sellers are committed to completing orders. iDNA sellers must top up their deposit before creating an order." />
          )}
          <SecurityDepositAmount
            amount={securityDeposit.amount}
            nativeCurrency={gnosis.nativeCurrency}
          />
        </UiInfoBlockContent>
      )}
      <Stack mt={2} spacing={2}>
        {controls}
        {securityDepositRD.data?.isInUse && (
          <Typography color="error">
            the deposit is already being used to secure another order. You have to wait until your
            this order is complete before withdrawing.
          </Typography>
        )}
      </Stack>
      {error && <UiError mt={1} err={error} />}
    </UiBlock>
  );
};

export const DepositControlsPage: FC = () => {
  const [web3Store] = useWeb3Store();
  const [xdaiSecurityDepositRD, xdaiSecurityDepositRDM] = useXdaiSecurityDeposit();

  return (
    <UiPage maxWidth="sm">
      <Typography variant="h4" component="h1" fontWeight={400}>
        Security deposits
      </Typography>
      <Stack mt={4} spacing={2}>
        <Stack spacing={2}>
          <DepositControlsIdena />
        </Stack>
        <Stack>
          {renderWalletRoutineIfNeeded(web3Store) || (
            <XdaiSecurityDepositOwnerView
              securityDepositRD={xdaiSecurityDepositRD}
              controls={
                <XdaiSecurityDepositControls
                  address={web3Store.address}
                  securityDepositRD={xdaiSecurityDepositRD}
                  securityDepositRDM={xdaiSecurityDepositRDM}
                  allowWithdrawal={true}
                />
              }
            />
          )}
        </Stack>
      </Stack>
    </UiPage>
  );
};
