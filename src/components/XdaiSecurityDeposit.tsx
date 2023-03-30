import { formatUnits } from 'ethers/lib/utils.js';
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
import { readXdaiSecurityDeposit, submitXdaiSecutityDeposit } from '../utils/xdai';
import { SecurityDepositInfoBlock } from './SecurityDepositInfo';
import { UiError, UiSubmitButton } from './ui';

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
  isWithdrawDisabled?: boolean;
}> = ({ address, securityDepositRD, securityDepositRDM, isWithdrawDisabled }) => {
  const { data: contractsAttrs } = useContractsAttributes();
  const [depositChangeRD, depositChangeRDM] = useRemoteData(null);
  const error = securityDepositRD.error || depositChangeRD.error;

  const renderDepositInfo = (children: ReactNode) => (
    <SecurityDepositInfoBlock
      securityDeposit={securityDepositRD.data}
      nativeCurrency={gnosis.nativeCurrency}
    >
      {children}
      {error && <UiError mt={1} err={error} />}
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

  const replenishDeposit = () => {
    if (!address || !contractsAttrs) return;

    const processTx = async () => {
      const tx = await submitXdaiSecutityDeposit(securityDepositRD.data.requiredAmount);
      return waitForTransaction({ hash: tx.hash });
    };

    depositChangeRDM
      .track(processTx())
      .then(() => securityDepositRDM.track(readXdaiSecurityDeposit(address, contractsAttrs.xdai)));
  };

  if (!securityDepositRD.data?.isValid)
    return (
      <>
        {renderDepositInfo(
          <UiSubmitButton onClick={replenishDeposit}>
            {`Replenish deposit for ${formatUnits(
              securityDepositRD.data.requiredAmount,
              gnosis.nativeCurrency.decimals,
            )} xDAI`}
          </UiSubmitButton>,
        )}
      </>
    );

  return renderDepositInfo(null);

  // TODO: move this logic to the specific order page
  const withdrawDeposit = () => {
    const processTx = async () => {
      const txConfig = await prepareWriteContract({
        ...contractInfo,
        functionName: 'withdrawSecurityDeposit',
      });
      log('withdrawDeposit txConfig', txConfig);
      const tx = await writeContract(txConfig);
      await waitForTransaction({ hash: tx.hash });
      await reloadSecurityDeposit();
    };

    depositChangeRDM.track(processTx().then(reloadSecurityDeposit));
  };

  return renderDepositInfo(
    <UiSubmitButton
      disabled={Boolean(isInUse || isWithdrawDisabled)}
      color="error"
      variant="outlined"
      onClick={withdrawDeposit}
    >
      Withdraw xDAI deposit
    </UiSubmitButton>,
  );
};
