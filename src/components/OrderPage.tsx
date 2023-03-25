import debug from 'debug';
import { ethers } from 'ethers';
import React, { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { Container, Stack, TextField, Typography } from '@mui/material';
import { switchNetwork } from '@wagmi/core';
import { gnosis } from '@wagmi/core/chains';

import abiToReceiveXdai from '../abi/idena-atomic-dex-gnosis.json';
import { CONTRACTS } from '../constants/contracts';
import { useRemoteData } from '../hooks/useRemoteData';
import { useGetSecurityDepositInfo } from '../hooks/useSecurityDepositInfo';
import { useWeb3Store } from '../providers/store/StoreProvider';
import {
  generateRandomSecret,
  getIdnaOrderState,
  getSecretHash,
  IdnaOrderState,
  MIN_IDNA_AMOUNT_TO_SELL,
} from '../utils/idena';
import { rData } from '../utils/remoteData';
import { DEFAULT_CHAIN_ID, isChainSupported, web3Modal } from '../utils/web3Modal';
import { IdenaOrderCreation } from './IdenaOrderCreation';
import { SecurityDeposit } from './SecurityDeposit';
import {
  UiPage,
  UiLabel,
  UiSubmitButton,
  UiError,
  UiBlock,
  UiBlockTitle,
  UiInfoBlockContent,
  UiInfoBlockRow,
} from './ui';
import { XdaiConfirmedOrder, readXdaiConfirmedOrder } from '../utils/xdai';
import { DATE_TIME_FORMAT, IdenaOrderInfoBlock } from './IdenaOrderInfo';
import { useParams } from 'react-router-dom';
import { isAddrEqual, shortenHash, ZERO_ADDRESS } from '../utils/address';
import { FCC } from '../types/FCC';
import dayjs from 'dayjs';

const log = debug('OrderCreationPage');

export const OrderPage: FC = () => {
  const { hash } = useParams() as { hash: string };
  const [{ chainId, address }] = useWeb3Store();
  const {
    rData: [securityDepositRD],
    reloadSecurityDeposit,
  } = useGetSecurityDepositInfo(CONTRACTS[gnosis.id].receiveXdai, abiToReceiveXdai);
  const [orderRD, orderRDM] = useRemoteData<IdnaOrderState>(null);
  const [confirmedOrderRD, confirmedOrderRDM] = useRemoteData<XdaiConfirmedOrder>(null);
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
        <ConfirmedOrderInfoBlock title="Confirmation in Gnosis chain" order={confirmedOrderRD.data}>
          {renderConfirmedOrderInfo()}
        </ConfirmedOrderInfoBlock>
      </Stack>
    </UiPage>
  );
};

export const ConfirmedOrderInfoBlock: FCC<{
  title: string;
  order: XdaiConfirmedOrder | null;
  showFullInfo?: boolean;
}> = ({ title, order, showFullInfo, children }) => {
  return (
    <UiBlock>
      <UiBlockTitle>{title}</UiBlockTitle>
      {order && (
        <UiInfoBlockContent mt={2}>
          <UiInfoBlockRow title="Owner:" value={String(order.owner)} />
          {showFullInfo || (true && <></>)}
          <UiInfoBlockRow
            title="Response deadline:"
            value={
              order.matchDeadline ? dayjs(order.matchDeadline).format(DATE_TIME_FORMAT) : 'None'
            }
          />
          <UiInfoBlockRow title="Matcher:" value={order.matcher || 'None'} />
          <UiInfoBlockRow
            title="xDAI depositing deadline:"
            value={
              order.executionDeadline
                ? dayjs(order.executionDeadline).format(DATE_TIME_FORMAT)
                : 'None'
            }
          />
        </UiInfoBlockContent>
      )}
      {React.Children.toArray(children).filter(Boolean).length > 0 && (
        <Stack mt={2} alignItems="stretch">
          {children}
        </Stack>
      )}
    </UiBlock>
  );
};
