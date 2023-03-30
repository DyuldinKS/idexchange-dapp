import dayjs from 'dayjs';
import React from 'react';

import { Box, Grid } from '@mui/material';

import { FCC } from '../types/FCC';
import { IdenaOrderState } from '../utils/idena';
import { UiBlock, UiBlockTitle, UiInfoBlockContent, UiInfoBlockRow, UiSubmitButton } from './ui';
import { XdaiConfirmedOrder } from '../utils/xdai';
import { Link } from 'react-router-dom';
import { shortenHash } from '../utils/address';

export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm Z';

export const ShortOrderInfo: FCC<
  NonNullable<{ dnaState: IdenaOrderState; xdaiState: XdaiConfirmedOrder | null } & { id: string }>
> = ({ id, dnaState, xdaiState }) => {
  return (
    <UiBlock>
      <Link to={`/order/${id}`}>
        <UiBlockTitle>{`Order ${shortenHash(id)}`}</UiBlockTitle>
      </Link>
      <UiInfoBlockContent>
        <UiInfoBlockRow label="Id:" value={id} />
        <UiInfoBlockRow
          label="Exchange:"
          value={
            <Box component="span">
              <Box fontWeight="600" component="span">
                {dnaState.amountDna}
              </Box>{' '}
              iDNA for{' '}
              <Box fontWeight="600" component="span">
                {dnaState.amountXdai}
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
                {(Number(dnaState.amountXdai) / Number(dnaState.amountDna)).toFixed(3)}
              </Box>{' '}
              xDAI
            </Box>
          }
        />
        <UiInfoBlockRow
          label="Expire time:"
          value={dayjs(dnaState.expireAt).format(DATE_TIME_FORMAT)}
        />
      </UiInfoBlockContent>
    </UiBlock>
  );
};
