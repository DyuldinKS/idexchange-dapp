import { formatUnits, isAddress } from 'ethers/lib/utils.js';
import { Transaction } from 'idena-sdk-js';
import { FC, ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { Link, Stack, Typography, useTheme } from '@mui/material';

import { useRemoteData, UseRemoteDataMethods } from '../hooks/useRemoteData';
import { SecurityDepositType } from '../types/contracts';
import {
  buildTopUpIdenaSecurityDepositTx,
  buildWithdrawIdenaSecurityDepositTx,
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
import { UiBlockTitle, UiError, UiSpan, UiSubmitButton } from './ui';

export type IdenaSecurityDepositProps = {
  address: string;
  securityDepositRD: RemoteData<SecurityDepositType>;
  securityDepositRDM: UseRemoteDataMethods<SecurityDepositType>;
  // TODO: replace with onTopUpHandler
  form: UseFormReturn<AddressSchema>;
  isWithdrawDisabled?: boolean;
  allowWithdrawal?: boolean;
};

export const IDENA_SEC_DEPOSIT_TEXTS = {
  exclusionExample:
    'The existence of a deposit incentivizes the buyer to fulfill their obligation in the transaction. For instance, if a buyer books an order on Idena network and subsequently fails to pay xDAI on Gnosis network, their deposit will be seized.',
};

export const IdenaSecurityDepositBuyerPage: FC<
  IdenaSecurityDepositProps & {
    showAlreadyUsedError?: boolean;
  }
> = (props) => {
  const { securityDepositRD, showAlreadyUsedError } = props;
  const error = securityDepositRD.error;

  return (
    <SecurityDepositInfoBlock
      securityDeposit={securityDepositRD.data}
      nativeCurrency={IDENA_CHAIN.nativeCurrency}
      title={
        <UiBlockTitle tooltip={IDENA_SEC_DEPOSIT_TEXTS.exclusionExample}>
          iDNA security deposit
        </UiBlockTitle>
      }
      description={
        securityDepositRD.data?.amount.eq(0) &&
        'In order to guarantee the reliability of the exchange, it is essential to make a deposit of iDNA. After the exchange is completed, the iDNA can be withdrawn from the protocol back to your wallet.'
      }
    >
      <Stack mt={2} spacing={2}>
        <IdenaSecurityDepositControls {...props} />
        {showAlreadyUsedError && (
          <Typography color="error">
            This deposit is already being used to confirm another order booking. You have to wait
            until that order is complete or use a different account to book this one.
          </Typography>
        )}
      </Stack>
      {error && <UiError err={error} />}
    </SecurityDepositInfoBlock>
  );
};

export const IdenaSecurityDepositControls: FC<IdenaSecurityDepositProps> = ({
  address,
  securityDepositRD,
  securityDepositRDM,
  form,
  allowWithdrawal,
}) => {
  const [topUpDepositTxRD, topUpDepositTxRDM] = useRemoteData<Transaction>(null);
  const [withdrawDepositTxRD, withdrawDepositTxRDM] = useRemoteData<Transaction>(null);
  const theme = useTheme();

  if (rData.isNotAsked(securityDepositRD))
    return (
      <UiSpan>
        {!isAddress(address || '')
          ? 'Idena address is not provided.'
          : 'Cannot load security deposit.'}
      </UiSpan>
    );
  if (rData.isLoading(securityDepositRD)) return <UiSpan>Loading...</UiSpan>;
  if (rData.isFailure(securityDepositRD)) return null;

  const deposit = securityDepositRD.data;
  // if (deposit.isValid) return renderDepositInfo(null);
  // handled by SecurityDepositInfoBlock
  if (deposit.isInUse) return null;

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

  if (!deposit.isValid) {
    return (
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
                securityDepositRDM.track(readIdenaSecurityDeposit(address));
              }}
            >
              Check deposit
            </UiSubmitButton>
          </>
        )}
        {rData.isFailure(topUpDepositTxRD) && <UiError err={topUpDepositTxRD.error} />}
      </Stack>
    );
  }

  const buildWithdrawDepositTx = async (
    evt: React.BaseSyntheticEvent,
  ): Promise<Transaction | null> => {
    return new Promise((resolve) => {
      form
        .handleSubmit(({ idenaAddress }) => {
          const txPromise = buildWithdrawIdenaSecurityDepositTx(idenaAddress);
          withdrawDepositTxRDM.track(txPromise);
          resolve(txPromise);
        })(evt)
        .catch((err) => {
          console.warn('buildWithdrawDepositTx caught', err);
          resolve(null);
        });
    });
  };

  const buildWithdrawDepositTxAndSign = async (evt: React.BaseSyntheticEvent) => {
    return buildWithdrawDepositTx(evt).then((tx) => tx && openIdenaAppToSignTx(tx));
  };

  if (allowWithdrawal) {
    return (
      <Stack spacing={2}>
        {!rData.isSuccess(withdrawDepositTxRD) && (
          <UiSubmitButton
            onClick={buildWithdrawDepositTxAndSign}
            disabled={rData.isLoading(withdrawDepositTxRD)}
            variant="outlined"
          >
            {`Withdraw ${formatUnits(deposit.requiredAmount, IDENA_DECIMALS)} iDNA`}
          </UiSubmitButton>
        )}
        {rData.isSuccess(withdrawDepositTxRD) && (
          // TODO: move to IdenaTxLinkRoutine component
          <>
            <Typography color={getColor.textGrey(theme)}>
              Click{' '}
              <Link href={getIdenaLinkToSignTx(withdrawDepositTxRD.data)} target="_blank">
                this link
              </Link>{' '}
              if Idena App did not open automatically. Wait for the transaction to complete, then
              reload deposit state.
            </Typography>
            <UiSubmitButton
              sx={{ mt: 2 }}
              onClick={() => {
                securityDepositRDM.track(readIdenaSecurityDeposit(address));
              }}
            >
              Check deposit
            </UiSubmitButton>
          </>
        )}
        {rData.isFailure(withdrawDepositTxRD) && <UiError err={withdrawDepositTxRD.error} />}
      </Stack>
    );
  }

  return null;
};
