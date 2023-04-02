import debug from 'debug';
import { FC } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useIdenaSecurityDeposit } from '../hooks/useIdenaSecurityDeposit';
import { useXdaiSecurityDeposit } from '../hooks/useXdaiSecurityDeposit';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { IDENA_CHAIN } from '../utils/idena';
import { IDENA_SEC_DEPOSIT_TEXTS, IdenaSecurityDepositControls } from './IdenaSecurityDeposit';
import { AddressSchema, addressSchema } from './OrderBuyerView';
import { renderWalletRoutineIfNeeded } from './WalletRoutine';
import { XdaiSecurityDeposit } from './XdaiSecurityDeposit';
import { UiBlock, UiBlockTitle, UiError, UiInfoBlockContent, UiInfoBlockRow, UiPage } from './ui';
import { SecurityDepositAmount } from './SecurityDepositInfo';

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
        {error && <UiError err={error} />}
      </Stack>
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
            <XdaiSecurityDeposit
              address={web3Store.address}
              securityDepositRD={xdaiSecurityDepositRD}
              securityDepositRDM={xdaiSecurityDepositRDM}
              allowWithdrawal={true}
            />
          )}
        </Stack>
      </Stack>
    </UiPage>
  );
};
