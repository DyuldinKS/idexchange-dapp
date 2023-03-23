import dayjs from 'dayjs';
import { FC } from 'react';

import { Typography } from '@mui/material';
import { Stack } from '@mui/system';

import { FCC } from '../types/FCC';
import { IdnaOrderState } from '../utils/idena';
import { UiBlock, UiInfoBlockContent, UiInfoBlockRow } from './ui';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm Z';

export const IdenaOrderInfo: FC<NonNullable<IdnaOrderState>> = ({
  owner,
  amountDna,
  amountXdai,
  expirationAt,
}) => {
  return (
    <UiInfoBlockContent mt={2}>
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

export const IdenaOrderInfoBlock: FCC<{ order?: IdnaOrderState | null }> = ({
  order,
  children,
}) => {
  return (
    <UiBlock alignItems="start">
      <Typography variant="h3" fontSize="1.125rem" display="flex" alignItems="center">
        Order to sell iDNA
      </Typography>
      {order && <IdenaOrderInfo {...order} />}
      <Stack mt={2} alignItems="stretch">
        {children}
      </Stack>
    </UiBlock>
  );
};
