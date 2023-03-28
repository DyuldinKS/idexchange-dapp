import { formatUnits } from 'ethers/lib/utils.js';
import { Transaction } from 'idena-sdk-js';
import { FC, ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { Link, Stack, Typography, useTheme } from '@mui/material';

import { IdenaSecurityDepositState } from '../hooks/useIdenaSecurityDeposit';
import { useRemoteData, UseRemoteDataMethods } from '../hooks/useRemoteData';
import {
  buildTopUpIdenaSecurityDepositTx,
  getIdenaLinkToSignTx,
  IDENA_CHAIN,
  IDENA_DECIMALS,
  openIdenaAppToSignTx,
  readIdenaSecurityDeposit,
} from '../utils/idena';
import { rData, RemoteData } from '../utils/remoteData';
import { getColor } from '../utils/theme';
import { AddressSchema } from './OrderBuyerView';
import { SecurityDepositInfoBlock } from './SecurityDepositInfo';
import { UiError, UiSubmitButton } from './ui';

export const IdenaSecurityDeposit: FC<{
  securityDepositRD: RemoteData<IdenaSecurityDepositState>;
  securityDepositRDM: UseRemoteDataMethods<IdenaSecurityDepositState>;
  // TODO: replace with onTopUpHandler
  form: UseFormReturn<AddressSchema>;
  isWithdrawDisabled?: boolean;
}> = ({ securityDepositRD, securityDepositRDM, form, isWithdrawDisabled }) => {
  const [depositChangeRD, depositChangeRDM] = useRemoteData(null);
  const error = securityDepositRD.error || depositChangeRD.error;
  const [topUpDepositTxRD, topUpDepositTxRDM] = useRemoteData<Transaction>(null);
  const theme = useTheme();

  const renderDepositInfo = (children: ReactNode) => (
    <SecurityDepositInfoBlock
      securityDeposit={securityDepositRD.data}
      nativeCurrency={IDENA_CHAIN.nativeCurrency}
    >
      {children}
      {error && <UiError err={error} />}
    </SecurityDepositInfoBlock>
  );

  if (rData.isNotAsked(securityDepositRD))
    return renderDepositInfo('Idena address is not provided.');
  if (rData.isLoading(securityDepositRD)) return renderDepositInfo('Loading...');
  if (rData.isFailure(securityDepositRD)) return renderDepositInfo(null);

  const deposit = securityDepositRD.data;
  if (deposit.isValid) return renderDepositInfo(null);
  // handled by SecurityDepositInfoBlock
  if (deposit.isInUse) return renderDepositInfo(null);

  if (rData.isLoading(depositChangeRD))
    return renderDepositInfo(<UiSubmitButton disabled>Updating iDNA deposit...</UiSubmitButton>);

  const buildTopUpDepositTx = async (
    evt: React.BaseSyntheticEvent,
  ): Promise<Transaction | null> => {
    return new Promise((resolve) => {
      form
        .handleSubmit(({ address }) => {
          const txPromise = buildTopUpIdenaSecurityDepositTx(address);
          topUpDepositTxRDM.track(txPromise);
          resolve(txPromise);
        })(evt)
        .catch((err) => {
          console.warn('buildTopUpDepositTxAndSign caught', err);
          resolve(null);
        });
    });
  };

  const buildTopUpDepositTxAndSign = async (evt: React.BaseSyntheticEvent) => {
    return buildTopUpDepositTx(evt).then((tx) => tx && openIdenaAppToSignTx(tx));
  };

  return renderDepositInfo(
    <Stack spacing={2}>
      {!rData.isSuccess(topUpDepositTxRD) && (
        <UiSubmitButton
          onClick={buildTopUpDepositTxAndSign}
          disabled={rData.isLoading(topUpDepositTxRD)}
        >
          {`Replenish deposit for ${formatUnits(
            securityDepositRD.data.requiredAmount,
            IDENA_DECIMALS,
          )} iDNA`}
        </UiSubmitButton>
      )}
      {rData.isSuccess(topUpDepositTxRD) && (
        // TODO: move to IdenaTxLinkRoutine component
        <>
          <Typography color={getColor.textGrey(theme)}>
            Click{' '}
            <Link href={getIdenaLinkToSignTx(topUpDepositTxRD.data)} target="_blank">
              this link
            </Link>{' '}
            if Idena App did not open automatically. Wait for the transaction to complete, then
            reload deposit state.
          </Typography>
          <UiSubmitButton
            sx={{ mt: 2 }}
            onClick={() => {
              securityDepositRDM.track(readIdenaSecurityDeposit(form.getValues('address')));
            }}
          >
            Check deposit
          </UiSubmitButton>
        </>
      )}
      {rData.isFailure(topUpDepositTxRD) && <UiError err={topUpDepositTxRD.error} />}
    </Stack>,
  );
};
