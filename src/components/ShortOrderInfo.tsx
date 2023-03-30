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
        <UiInfoBlockRow
          label="Amount:"
          value={
            <Box component="span">
              <Box fontWeight="600" component="span">
                {dnaState.amountDna}
              </Box>{' '}
              iDNA{' '}
            </Box>
          }
        />
        <UiInfoBlockRow
          label="Cost:"
          value={
            <Box component="span">
              <Box fontWeight="600" component="span">
                {dnaState.amountXdai}
              </Box>{' '}
              xDAI
            </Box>
          }
        />
        <UiInfoBlockRow
          label="Exchange rate:"
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
      </UiInfoBlockContent>
    </UiBlock>
  );
};
