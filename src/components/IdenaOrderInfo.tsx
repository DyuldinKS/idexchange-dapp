import dayjs from 'dayjs';
import React, { FC } from 'react';

import { Box } from '@mui/material';
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
      <UiInfoBlockRow
        title="Exchange:"
        value={
          <Box component="span">
            <Box fontWeight="600" component="span">
              {amountDna}
            </Box>{' '}
            iDNA for{' '}
            <Box fontWeight="600" component="span">
              {amountXdai}
            </Box>{' '}
            xDAI{' '}
          </Box>
        }
      />
      <UiInfoBlockRow
        title="Rate:"
        value={
          <Box component="span">
            iDNA ={' '}
            <Box fontWeight="600" component="span">
              {(Number(amountXdai) / Number(amountDna)).toFixed(3)}
            </Box>{' '}
            xDAI
          </Box>
        }
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
