import debug from 'debug';
import { FC, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Stack, Typography, useTheme } from '@mui/material';
import { gnosis } from '@wagmi/core/chains';

import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { CONTRACTS } from '../constants/contracts';
import { useRemoteData } from '../hooks/useRemoteData';
import { useGetSecurityDepositInfo } from '../hooks/useSecurityDepositInfo';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { shortenHash } from '../utils/address';
import { getIdnaOrderState, IdnaOrderState } from '../utils/idena';
import { isOrderConfirmationValid } from '../utils/orderControls';
import { rData } from '../utils/remoteData';
import { readXdaiConfirmedOrder, XdaiConfirmedOrder } from '../utils/xdai';
import { ConfirmedOrderInfoBlock } from './ConfirmedOrderInfo';
import { IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { UiError, UiPage } from './ui';

const log = debug('OrderCreationPage');

export const OrderPage: FC = () => {
  const { hash } = useParams() as { hash: string };
  const [{ chainId, address }] = useWeb3Store();
  const {
    rData: [securityDepositRD],
    reloadSecurityDeposit,
  } = useGetSecurityDepositInfo(CONTRACTS[gnosis.id].receiveXdai, abiToReceiveXdai);
  const [orderRD, orderRDM] = useRemoteData<IdnaOrderState | null>(null);
  const [confirmedOrderRD, confirmedOrderRDM] = useRemoteData<XdaiConfirmedOrder>(null);
  const theme = useTheme();
  console.log('>>> RD', orderRD, confirmedOrderRD);
  // const [secret] = useState(generateRandomSecret);
  // const secretHash = '0x933e53cd11087d89871cb9fff4382aa409014d4ff708333e69ac220b3c123e0c
  // const secretHash = '0xb7df2e05d1d74fa58fb5888f93343373d1d58987156254d58fcc9c61601eca42';

  useEffect(() => {
    orderRDM.track(getIdnaOrderState(hash));
    confirmedOrderRDM.track(readXdaiConfirmedOrder(hash));
  }, [hash]);

  const renderOrderContent = () => {
    if (rData.isNotAsked(orderRD) || rData.isLoading(orderRD)) return 'Loading...';
    if (rData.isFailure(orderRD)) return <UiError msg={orderRD.error} />;
    return orderRD.data ? null : 'Order not found.';
  };

  const renderConfirmedOrderInfo = () => {
    if (rData.isNotAsked(confirmedOrderRD) || rData.isLoading(confirmedOrderRD))
      return 'Loading...';
    if (rData.isFailure(confirmedOrderRD)) return <UiError msg={confirmedOrderRD.error} />;
    return confirmedOrderRD.data ? null : 'Order confirmation not found.';
  };

  return (
    <UiPage maxWidth="sm">
      <Typography variant="h4" component="h1" fontWeight={400}>
        {`Order ${shortenHash(hash, 6, 5)}`}
      </Typography>
      <Stack mt={4} spacing={2}>
        <IdenaOrderInfoBlock title="Idena chain" order={orderRD.data} secretHash={hash}>
          {renderOrderContent()}
        </IdenaOrderInfoBlock>
        <ConfirmedOrderInfoBlock
          isValid={isOrderConfirmationValid(orderRD.data, confirmedOrderRD.data)}
          title="Confirmation in Gnosis chain"
          order={confirmedOrderRD.data}
        >
          {renderConfirmedOrderInfo()}
        </ConfirmedOrderInfoBlock>
      </Stack>
    </UiPage>
  );
};
