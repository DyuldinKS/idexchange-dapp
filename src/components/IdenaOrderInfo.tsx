import { Box, Stack, TextField, Tooltip, Typography } from '@mui/material';

import { rData, RemoteData } from '../utils/remoteData';
import { UiInfoBlockContent, UiBlock, UiInfoBlockRow } from './ui';
import { IdnaOrderState } from '../utils/idena';
import { FCC } from '../types/FCC';
import dayjs from 'dayjs';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss Z';

export const IdenaOrderInfo: FCC<{
  infoRD: RemoteData<IdnaOrderState>;
}> = ({ children, infoRD }) => {
  return (
    <UiBlock alignItems="start">
      <Typography variant="h3" fontSize="1.125rem" display="flex" alignItems="center">
        Order to sell iDNA
      </Typography>
      {rData.isSuccess(infoRD) && (
        <UiInfoBlockContent mt={2}>
          <UiInfoBlockRow title="Owner:" value={infoRD.data.owner} />
          <UiInfoBlockRow title="Sell:" value={`${infoRD.data.amountDna} iDNA`} />
          <UiInfoBlockRow title="Receive:" value={`${infoRD.data.amountXdai} xDAI`} />
          <UiInfoBlockRow
            title="Rate:"
            value={`iDNA = ${(
              Number(infoRD.data.amountXdai) / Number(infoRD.data.amountDna)
            ).toFixed(3)} xDAI`}
          />
          <UiInfoBlockRow
            title="Expire time:"
            value={dayjs(infoRD.data.expirationAt).format(DATE_TIME_FORMAT)}
          />
        </UiInfoBlockContent>
      )}
      <Stack mt={2} alignItems="stretch">
        {children}
      </Stack>
    </UiBlock>
  );
};
