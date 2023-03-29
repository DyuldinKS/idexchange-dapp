import dayjs from 'dayjs';
import React from 'react';

import { Box, Grid } from '@mui/material';

import { FCC } from '../types/FCC';
import { IdenaOrderState } from '../utils/idena';
import { UiInfoBlockContent, UiInfoBlockRow, UiSubmitButton } from './ui';
import { XdaiConfirmedOrder } from '../utils/xdai';
import { Link } from 'react-router-dom';

export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm Z';

export const ShortOrderInfo: FCC<NonNullable<{ dnaState: IdenaOrderState, xdaiState: XdaiConfirmedOrder } & { id: string }>> = ({
  id,
  dnaState,
  xdaiState,
}) => {
  return (
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
      <UiInfoBlockRow label="Expire time:" value={dayjs(dnaState.expireAt).format(DATE_TIME_FORMAT)} />
      <Grid item xs={12} sm={4}>
        <UiSubmitButton size="large" LinkComponent={Link} {...{ to: `/order/${id}` }}>
          Go to order
        </UiSubmitButton>
      </Grid>
    </UiInfoBlockContent>
  );
};
