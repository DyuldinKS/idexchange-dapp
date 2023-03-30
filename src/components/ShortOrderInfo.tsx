import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

import { Box, useTheme } from '@mui/material';

import { FCC } from '../types/FCC';
import { shortenHash } from '../utils/address';
import { IdenaOrderState } from '../utils/idena';
import { getColor } from '../utils/theme';
import { XdaiConfirmedOrder } from '../utils/xdai';
import { UiBlock, UiBlockTitle, UiInfoBlockContent, UiInfoBlockRow } from './ui';

export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm Z';

export const ShortOrderInfo: FCC<
  NonNullable<{ dnaState: IdenaOrderState; xdaiState: XdaiConfirmedOrder | null } & { id: string }>
> = ({ id, dnaState, xdaiState }) => {
  const theme = useTheme();
  return (
    <UiBlock>
      <Link to={`/order/${id}`}>
        <UiBlockTitle color={getColor.textLink(theme)}>{`Order ${shortenHash(id)}`}</UiBlockTitle>
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
