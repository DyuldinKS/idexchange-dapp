import { formatUnits } from 'ethers/lib/utils.js';
import { FC, ReactNode } from 'react';

import { prepareWriteContract, waitForTransaction, writeContract } from '@wagmi/core';
import { gnosis } from '@wagmi/core/chains';

import debug from 'debug';
import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { CONTRACTS } from '../constants/contracts';
import { useRemoteData } from '../hooks/useRemoteData';
import { SecurityDepositInfoType } from '../hooks/useSecurityDepositInfo';
import { rData, RemoteData } from '../utils/remoteData';
import { SecurityDepositInfoBlock } from './SecurityDepositInfo';
import { UiError, UiSubmitButton } from './ui';

const log = debug('SecurityDeposit');

const contractInfo = {
  chainId: gnosis.id,
  address: CONTRACTS[gnosis.id].receiveXdai,
  abi: abiToReceiveXdai,
};

export const SecurityDeposit: FC<{
  state: RemoteData<SecurityDepositInfoType>;
  reloadSecurityDeposit: () => Promise<SecurityDepositInfoType | null>;
  isWithdrawDisabled?: boolean;
}> = ({ state: securityDepositRD, reloadSecurityDeposit, isWithdrawDisabled }) => {
  const [depositChangeRD, depositChangeRDM] = useRemoteData(null);
  const error = securityDepositRD.error || depositChangeRD.error;

  if (rData.isNotAsked(securityDepositRD) || rData.isLoading(securityDepositRD))
    return <UiSubmitButton disabled>Loading...</UiSubmitButton>;

  if (!rData.isSuccess(securityDepositRD))
    return <UiSubmitButton disabled>Error occurred</UiSubmitButton>;

  const { isInUse } = securityDepositRD.data;

  const renderDepositInfo = (children: ReactNode) => (
    <SecurityDepositInfoBlock
      securityDeposit={securityDepositRD.data}
      nativeCurrency={gnosis.nativeCurrency}
    >
      {children}
      {error && <UiError err={error} />}
    </SecurityDepositInfoBlock>
  );

  if (isInUse) return renderDepositInfo(null);

  const replenishDeposit = () => {
    const processTx = async () => {
      const txConfig = await prepareWriteContract({
        ...contractInfo,
        functionName: 'submitSecurityDeposit',
        overrides: {
          value: securityDepositRD.data.requiredAmount,
        },
      });
      log('replenishDeposit txConfig', txConfig);
      const tx = await writeContract(txConfig);
      return waitForTransaction({ hash: tx.hash });
    };

    depositChangeRDM.track(processTx().then(reloadSecurityDeposit));
  };

  if (rData.isLoading(depositChangeRD))
    return renderDepositInfo(<UiSubmitButton disabled>Updating xDAI deposit...</UiSubmitButton>);

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
