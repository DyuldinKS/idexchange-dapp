import debug from 'debug';
import { FC } from 'react';

import { UiBlockTitle, UiError, UiPage } from './ui';
import { XdaiSecurityDeposit } from './XdaiSecurityDeposit';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { renderWalletRoutineIfNeeded } from './WalletRoutine';
import { useXdaiSecurityDeposit } from '../hooks/useXdaiSecurityDeposit';
import {
  IDENA_SEC_DEPOSIT_TEXTS,
  IdenaSecurityDepositControls,
  IdenaSecurityDepositProps,
} from './IdenaSecurityDeposit';
import { Stack, TextField, Typography } from '@mui/material';
import { useIdenaSecurityDeposit } from '../hooks/useIdenaSecurityDeposit';
import { AddressSchema, addressSchema } from './OrderBuyerView';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { SecurityDepositInfoBlock } from './SecurityDepositInfo';
import { IDENA_CHAIN } from '../utils/idena';

const log = debug('DepositControlsPage');

export const DepositControlsIdena: FC<IdenaSecurityDepositProps> = (props) => {
  const { securityDepositRD } = props;
  const error = securityDepositRD.error;
  const { data: securityDeposit } = securityDepositRD;

  return (
    <SecurityDepositInfoBlock
      securityDeposit={securityDeposit}
      nativeCurrency={IDENA_CHAIN.nativeCurrency}
      title={
        <UiBlockTitle tooltip={IDENA_SEC_DEPOSIT_TEXTS.exclusionExample}>
          iDNA security deposit
        </UiBlockTitle>
      }
      description="In order to ensure that buyers are trustworthy, the protocol requires them to make one-time security deposit in iDNA."
    >
      <Stack mt={2} spacing={2}>
        <IdenaSecurityDepositControls {...props} />
        {securityDeposit?.isInUse && (
          <Typography color="error">
            This deposit is already being used to confirm an order booking. You have to wait until
            this order is complete before withdrawing iDNA.
          </Typography>
        )}
      </Stack>
      {error && <UiError err={error} />}
    </SecurityDepositInfoBlock>
  );
};

export const DepositControlsPage: FC = () => {
  const [web3Store] = useWeb3Store();
  const [xdaiSecurityDepositRD, xdaiSecurityDepositRDM] = useXdaiSecurityDeposit();
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
  const [idenaSecurityDepositRD, idenaSecurityDepositRDM] = useIdenaSecurityDeposit(idenaAddress);
  return (
    <UiPage maxWidth="sm">
      <Typography variant="h4" component="h1" fontWeight={400}>
        Security deposits
      </Typography>
      <Stack mt={4} spacing={2}>
        <Stack spacing={2}>
          <TextField
            {...register('idenaAddress')}
            error={Boolean(errors.idenaAddress)}
            helperText={errors.idenaAddress?.message}
            placeholder="Your Idena address"
            fullWidth
            size="small"
          />
          <DepositControlsIdena
            address={idenaAddress}
            securityDepositRD={idenaSecurityDepositRD}
            securityDepositRDM={idenaSecurityDepositRDM}
            form={form}
            allowWithdrawal={true}
          />
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
