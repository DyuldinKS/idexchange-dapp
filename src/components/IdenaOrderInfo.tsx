import dayjs from 'dayjs';
import React, { FC } from 'react';

import { Box, useTheme } from '@mui/material';
import { Stack } from '@mui/system';

import { FCC } from '../types/FCC';
import { IdenaOrderState } from '../utils/idena';
import { UiBlock, UiBlockTitle, UiInfoBlockContent, UiInfoBlockRow, UiSpan } from './ui';

export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm Z';

export const IdenaOrderInfo: FC<NonNullable<IdenaOrderState & { id: string }>> = ({
  id,
  owner,
  amountDna,
  amountXdai,
  expireAt,
  matcher,
  matchExpireAt,
  matchDeadline,
}) => {
  const { palette } = useTheme();
  const isMatchExpired = Boolean(matchExpireAt && matchExpireAt <= Date.now());
  return (
    <UiInfoBlockContent>
      <UiInfoBlockRow label="Id:" value={id} />
      <UiInfoBlockRow label="Owner:" value={owner} />
      <UiInfoBlockRow
        label="Exchange:"
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
        label="Rate:"
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
      <UiInfoBlockRow
        label="Expire time:"
        value={
          <UiSpan color={expireAt < Date.now() ? palette.error.main : undefined}>
            {dayjs(expireAt).format(DATE_TIME_FORMAT)}
          </UiSpan>
        }
      />
      <UiInfoBlockRow
        label="Match deadline:"
        value={
          <UiSpan color={matchDeadline < Date.now() ? palette.error.main : undefined}>
            {dayjs(matchDeadline).format(DATE_TIME_FORMAT)}
          </UiSpan>
        }
      />
      <UiInfoBlockRow
        label="iDNA taker:"
        value={
          matcher ? (
            <UiSpan color={isMatchExpired ? palette.error.main : palette.secondary.dark}>
              {matcher}
            </UiSpan>
          ) : (
            'None'
          )
        }
      />
      <UiInfoBlockRow
        label="iDNA claim deadline:"
        value={
          matchExpireAt ? (
            <UiSpan color={isMatchExpired ? palette.error.main : palette.secondary.dark}>
              {dayjs(matchExpireAt).format(DATE_TIME_FORMAT)}
            </UiSpan>
          ) : (
            'None'
          )
        }
      />
    </UiInfoBlockContent>
  );
};

export const IdenaOrderInfoBlock: FCC<{
  title: string;
  order?: IdenaOrderState | null;
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
