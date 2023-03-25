import dayjs from 'dayjs';
import React, { FC } from 'react';

import { Typography } from '@mui/material';
import { Stack } from '@mui/system';

import { FCC } from '../types/FCC';
import { IdnaOrderState } from '../utils/idena';
import { UiBlock, UiBlockTitle, UiInfoBlockContent, UiInfoBlockRow } from './ui';

export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm Z';

export const IdenaOrderInfo: FC<NonNullable<IdnaOrderState & { id: string }>> = ({
  id,
  owner,
  amountDna,
  amountXdai,
  expirationAt,
}) => {
  return (
    <UiInfoBlockContent mt={2}>
      <UiInfoBlockRow title="Id:" value={id} />
      <UiInfoBlockRow title="Owner:" value={owner} />
      <UiInfoBlockRow title="Sell:" value={`${amountDna} iDNA`} />
      <UiInfoBlockRow title="Receive:" value={`${amountXdai} xDAI`} />
      <UiInfoBlockRow
        title="Rate:"
        value={`iDNA = ${(Number(amountXdai) / Number(amountDna)).toFixed(3)} xDAI`}
      />
      <UiInfoBlockRow title="Expire time:" value={dayjs(expirationAt).format(DATE_TIME_FORMAT)} />
    </UiInfoBlockContent>
  );
};

export const IdenaOrderInfoBlock: FCC<{
  title: string;
  order?: IdnaOrderState | null;
  secretHash: string;
}> = ({ title, order, children, secretHash }) => {
  return (
    <UiBlock alignItems="start">
      <UiBlockTitle>{title}</UiBlockTitle>
      {order && <IdenaOrderInfo id={secretHash} {...order} />}
      {React.Children.toArray(children).filter(Boolean).length > 0 && (
        <Stack mt={2} alignItems="stretch">
          {children}
        </Stack>
      )}
    </UiBlock>
  );
};
