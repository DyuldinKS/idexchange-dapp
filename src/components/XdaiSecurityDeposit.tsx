import { formatUnits, isAddress } from 'ethers/lib/utils.js';
import { FC, ReactNode } from 'react';

import { prepareWriteContract, waitForTransaction, writeContract } from '@wagmi/core';
import { gnosis } from '@wagmi/core/chains';

import debug from 'debug';
import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { CONTRACTS } from '../constants/contracts';
import { useContractsAttributes } from '../hooks/useContractsAttributes';
import { useRemoteData, UseRemoteDataMethods } from '../hooks/useRemoteData';
import { SecurityDepositType } from '../types/contracts';
import { rData, RemoteData } from '../utils/remoteData';
import {
  readXdaiSecurityDeposit,
  submitXdaiSecutityDeposit,
  withdrawXdaiSecurityDeposit,
} from '../utils/xdai';
import { SecurityDepositInfoBlock } from './SecurityDepositInfo';
import { UiBlockTitle, UiError, UiSubmitButton } from './ui';
import { Typography } from '@mui/material';

const log = debug('XdaiSecurityDeposit');

const contractInfo = {
  chainId: gnosis.id,
  address: CONTRACTS[gnosis.id].receiveXdai,
  abi: abiToReceiveXdai,
};

export const XdaiSecurityDeposit: FC<{
  address: string | null;
  securityDepositRD: RemoteData<SecurityDepositType>;
  securityDepositRDM: UseRemoteDataMethods<SecurityDepositType>;
  allowWithdrawal?: boolean;
}> = ({ address, securityDepositRD, securityDepositRDM, allowWithdrawal }) => {
  const { data: contractsAttrs } = useContractsAttributes();
  const [depositChangeTxRD, depositChangeTxRDM] = useRemoteData(null);
  const error = securityDepositRD.error || depositChangeTxRD.error;

  const renderDepositInfo = (children: ReactNode) => (
    <SecurityDepositInfoBlock
      title={<UiBlockTitle>xDAI security deposit</UiBlockTitle>}
      securityDeposit={securityDepositRD.data}
      nativeCurrency={gnosis.nativeCurrency}
    >
      {children}
      {securityDepositRD.data?.isInUse && (
        <Typography mt={2} color="error">
          This deposit is already being used to confirm another order. You have to wait until your
          previous order is complete or use a different account to create a new order.
        </Typography>
      )}
      {error && <UiError mt={1} err={error} />}
    </SecurityDepositInfoBlock>
  );

  if (rData.isNotAsked(securityDepositRD))
    return renderDepositInfo(
      !isAddress(address || '') ? 'xDAI address is not provided.' : 'Cannot load security deposit.',
    );
  if (rData.isLoading(securityDepositRD) || !contractsAttrs) return renderDepositInfo('Loading...');
  if (rData.isFailure(securityDepositRD)) return renderDepositInfo(null);

  const deposit = securityDepositRD.data;
  // if (deposit.isValid) return renderDepositInfo(null);
  // handled by SecurityDepositInfoBlock
  if (deposit.isInUse) return renderDepositInfo(null);

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
      <>
        {renderDepositInfo(
          <UiSubmitButton disabled={isTxLoading} onClick={replenishDeposit}>
            {!isTxLoading ? `Deposit ${amountStr} xDAI` : 'Updating security deposit...'}
          </UiSubmitButton>,
        )}
      </>
    );

  const withdrawDeposit = () => {
    if (!address || !contractsAttrs) return;

    depositChangeTxRDM
      .track(withdrawXdaiSecurityDeposit().then((tx) => waitForTransaction({ hash: tx.hash })))
      .then(() => securityDepositRDM.track(readXdaiSecurityDeposit(address, contractsAttrs.xdai)));
  };

  if (allowWithdrawal) {
    return renderDepositInfo(
      <UiSubmitButton variant="outlined" disabled={isTxLoading} onClick={withdrawDeposit}>
        {!isTxLoading ? `Withdraw ${amountStr} xDAI` : 'Updating security deposit...'}
      </UiSubmitButton>,
    );
  }

  return renderDepositInfo(null);
};
