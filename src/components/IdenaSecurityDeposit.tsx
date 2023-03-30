import { formatUnits } from 'ethers/lib/utils.js';
import { Transaction } from 'idena-sdk-js';
import { FC, ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { Link, Stack, Typography, useTheme } from '@mui/material';

import { useRemoteData, UseRemoteDataMethods } from '../hooks/useRemoteData';
import { SecurityDepositType } from '../types/contracts';
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
import { UiBlockTitle, UiError, UiSubmitButton } from './ui';

export const IdenaSecurityDeposit: FC<{
  securityDepositRD: RemoteData<SecurityDepositType>;
  securityDepositRDM: UseRemoteDataMethods<SecurityDepositType>;
  // TODO: replace with onTopUpHandler
  form: UseFormReturn<AddressSchema>;
  isWithdrawDisabled?: boolean;
  showAlreadyUsedError?: boolean;
}> = ({ securityDepositRD, securityDepositRDM, form, showAlreadyUsedError }) => {
  const error = securityDepositRD.error;
  const [topUpDepositTxRD, topUpDepositTxRDM] = useRemoteData<Transaction>(null);
  const theme = useTheme();

  const renderDepositInfo = (children: ReactNode) => (
    <SecurityDepositInfoBlock
      securityDeposit={securityDepositRD.data}
      nativeCurrency={IDENA_CHAIN.nativeCurrency}
      title={
        <UiBlockTitle tooltip="The existence of a deposit incentivizes the buyer to fulfill their obligation in the transaction. For instance, if a buyer books an order on Idena network and subsequently fails to pay xDAI on Gnosis network, their deposit will be seized.">
          iDNA security deposit
        </UiBlockTitle>
      }
      description={
        securityDepositRD.data?.amount.eq(0)
          ? 'In order to guarantee the reliability of the exchange, it is essential to make a deposit of iDNA. After the exchange is completed, the iDNA can be withdrawn from the protocol back to your wallet.'
          : undefined
      }
    >
      {children}
      {showAlreadyUsedError && (
        <Typography mt={children ? 2 : 0} color="error">
          This deposit is already being used to confirm another order booking. You have to wait
          until your previous order is complete or use a different account to book a new one.
        </Typography>
      )}
      {error && <UiError err={error} />}
    </SecurityDepositInfoBlock>
  );

  if (rData.isNotAsked(securityDepositRD))
    return renderDepositInfo('Cannot load security deposit.');
  if (rData.isLoading(securityDepositRD)) return renderDepositInfo('Loading...');
  if (rData.isFailure(securityDepositRD)) return renderDepositInfo(null);

  const deposit = securityDepositRD.data;
  if (deposit.isValid) return renderDepositInfo(null);
  // handled by SecurityDepositInfoBlock
  if (deposit.isInUse) return renderDepositInfo(null);

  const buildTopUpDepositTx = async (
    evt: React.BaseSyntheticEvent,
  ): Promise<Transaction | null> => {
    return new Promise((resolve) => {
      form
        .handleSubmit(({ idenaAddress }) => {
          const txPromise = buildTopUpIdenaSecurityDepositTx(idenaAddress);
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
          {`Deposit ${formatUnits(securityDepositRD.data.requiredAmount, IDENA_DECIMALS)} iDNA`}
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
              securityDepositRDM.track(readIdenaSecurityDeposit(form.getValues('idenaAddress')));
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
