import { formatUnits, isAddress } from 'ethers/lib/utils.js';
import { FC, ReactNode } from 'react';

import { waitForTransaction } from '@wagmi/core';
import { gnosis } from '@wagmi/core/chains';

import { Stack, Typography } from '@mui/material';
import { useContractsAttributes } from '../hooks/useContractsAttributes';
import { useRemoteData, UseRemoteDataMethods } from '../hooks/useRemoteData';
import { SecurityDepositType } from '../types/contracts';
import { rData, RemoteData } from '../utils/remoteData';
import {
  readXdaiSecurityDeposit,
  submitXdaiSecutityDeposit,
  withdrawXdaiSecurityDeposit,
} from '../utils/xdai';
import { SecurityDepositAmount } from './SecurityDepositInfo';
import {
  UiBlock,
  UiBlockTitle,
  UiError,
  UiInfoBlockContent,
  UiInfoBlockRow,
  UiSpan,
  UiSubmitButton,
} from './ui';
import { FCC } from '../types/FCC';

export const XDAI_SEC_DEPOSIT_TEXTS = {
  exclusionExample:
    "The existence of a deposit incentivizes the seller to fulfill their obligation in the transaction. For instance, if a seller confirms an order on Gnosis network, someone matches that order by locking xDAI for the seller to claim, and then a seller fails to reveal the secret on Gnosis network, seller's security deposit will be seized in the following manner: 50% to the mather to compensate seized security deposit on Idena network and 50% to the protocol fund.",
};

export const XdaiSecurityDepositOwnerView: FC<{
  securityDepositRD: RemoteData<SecurityDepositType>;
  controls: ReactNode;
}> = ({ securityDepositRD, controls }) => {
  const error =
    (securityDepositRD.data?.isInUse &&
      'This deposit is already being used to confirm another order. You have to wait until your previous order is complete or use a different account to create a new order.') ||
    securityDepositRD.error;
  const securityDeposit = securityDepositRD.data;

  return (
    <UiBlock alignItems="start">
      <UiBlockTitle tooltip={XDAI_SEC_DEPOSIT_TEXTS.exclusionExample}>
        xDAI security deposit
      </UiBlockTitle>
      <Stack mt={2} spacing={2}>
        {securityDeposit && (
          <Stack spacing={1}>
            {securityDeposit.amount.eq(0) && (
              <UiInfoBlockRow
                label={
                  'In order to guarantee the reliability of the exchange, it is essential to make a deposit of xDAI. After the exchange is completed, the it can be withdrawn from the protocol back to your wallet.'
                }
              />
            )}
            <SecurityDepositAmount
              amount={securityDeposit.amount}
              nativeCurrency={gnosis.nativeCurrency}
            />
          </Stack>
        )}
        {controls}
        {error && <UiError mt={1} err={error} />}
      </Stack>
    </UiBlock>
  );
};

export const XdaiSecurityDepositControls: FCC<{
  address: string | null;
  securityDepositRD: RemoteData<SecurityDepositType>;
  securityDepositRDM: UseRemoteDataMethods<SecurityDepositType>;
  allowWithdrawal?: boolean;
}> = ({ address, securityDepositRD, securityDepositRDM, allowWithdrawal }) => {
  const { data: contractsAttrs } = useContractsAttributes();
  const [depositChangeTxRD, depositChangeTxRDM] = useRemoteData(null);

  if (rData.isNotAsked(securityDepositRD))
    return (
      <UiSpan>
        {!isAddress(address || '')
          ? 'xDAI address is not provided.'
          : 'Cannot load security deposit.'}
      </UiSpan>
    );
  if (rData.isLoading(securityDepositRD) || !contractsAttrs) return <UiSpan>Loading...</UiSpan>;
  if (rData.isFailure(securityDepositRD)) return null;

  const deposit = securityDepositRD.data;
  if (deposit.isInUse) return null;

  const replenishDeposit = () => {
    if (!address || !contractsAttrs) return;

    const processTx = async () => {
      const tx = await submitXdaiSecutityDeposit(securityDepositRD.data.requiredAmount);
      return waitForTransaction({ hash: tx.hash });
    };

    depositChangeTxRDM
      .track(processTx())
      .then(() => securityDepositRDM.track(readXdaiSecurityDeposit(address, contractsAttrs.xdai)));
  };

  const amountStr = formatUnits(
    contractsAttrs.xdai.securityDepositAmount,
    gnosis.nativeCurrency.decimals,
  );

  const isTxLoading = rData.isLoading(depositChangeTxRD);

  if (!deposit.isValid)
    return (
      <UiSubmitButton disabled={isTxLoading} onClick={replenishDeposit}>
        {!isTxLoading ? `Deposit ${amountStr} xDAI` : 'Updating security deposit...'}
      </UiSubmitButton>
    );

  const withdrawDeposit = () => {
    if (!address || !contractsAttrs) return;

    depositChangeTxRDM
      .track(withdrawXdaiSecurityDeposit().then((tx) => waitForTransaction({ hash: tx.hash })))
      .then(() => securityDepositRDM.track(readXdaiSecurityDeposit(address, contractsAttrs.xdai)));
  };

  if (allowWithdrawal) {
    return (
      <UiSubmitButton variant="outlined" disabled={isTxLoading} onClick={withdrawDeposit}>
        {!isTxLoading ? `Withdraw ${amountStr} xDAI` : 'Updating security deposit...'}
      </UiSubmitButton>
    );
  }

  return null;
};
