import debug from 'debug';
import { FC } from 'react';

import { UiPage } from './ui';
import { XdaiSecurityDeposit } from './XdaiSecurityDeposit';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { renderWalletRoutineIfNeeded } from './WalletRoutine';
import { useXdaiSecurityDeposit } from '../hooks/useXdaiSecurityDeposit';
import { IdenaSecurityDeposit } from './IdenaSecurityDeposit';
import { Stack, TextField, Typography } from '@mui/material';
import { useIdenaSecurityDeposit } from '../hooks/useIdenaSecurityDeposit';
import { AddressSchema, addressSchema } from './OrderBuyerView';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const log = debug('OrderPage');

export const DepositControls: FC = () => {
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
          <IdenaSecurityDeposit
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
