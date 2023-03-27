import dayjs from 'dayjs';
import { FC, useEffect, useState } from 'react';

import { Checkbox, FormControlLabel, Stack } from '@mui/material';

import { useRemoteData } from '../hooks/useRemoteData';
import { tapRejected } from '../utils/async';
import { downloadFile } from '../utils/misc';
import { rData } from '../utils/remoteData';
import {
  UiBlock,
  UiBlockTitle,
  UiInfoBlockContent,
  UiInfoBlockRow,
  UiSpan,
  UiSubmitButton,
} from './ui';

export const SecretCodeBlock: FC<{
  secret: string;
  secretHash: string;
  isSaved: boolean;
  setIsSaved: (isSaved: boolean) => void;
}> = ({ secret, secretHash, isSaved, setIsSaved }) => {
  const [copyingRD, copyingRDM] = useRemoteData<boolean>(null);
  const [saveBtnClicked, setSaveBtnClicked] = useState(false);

  const infoToSave = `Secret: ${secret}\nOrder id: ${secretHash}`;
  const isCopied = Boolean(copyingRD.data);
  const isCopyBtnClicked = !rData.isNotAsked(copyingRD);

  useEffect(() => {
    if (isCopied) {
      const timerId = setTimeout(() => {
        copyingRDM.setSuccess(false);
      }, 2000);
      return () => clearTimeout(timerId);
    }
  }, [isCopied, copyingRDM]);

  return (
    <UiBlock mt={4}>
      <UiBlockTitle
        tooltip="A secret code has been automatically generated for your order, which you must copy and
  securely store. Losing this code would prevent you from either completing or canceling
  your order, resulting in the loss of your funds."
      >
        Secret code
      </UiBlockTitle>
      <UiInfoBlockContent>
        <UiInfoBlockRow title="Secret:" value={secret} />
        <UiInfoBlockRow title={<UiSpan>Order&nbsp;id:</UiSpan>} value={secretHash} />
      </UiInfoBlockContent>
      {!isSaved && (
        <Stack mt={2} direction="row" spacing={1}>
          <UiSubmitButton
            variant="outlined"
            fullWidth
            size="medium"
            disabled={isCopied}
            onClick={() => {
              navigator.clipboard
                .writeText(infoToSave)
                .then(() => {
                  copyingRDM.setSuccess(true);
                })
                .catch(
                  tapRejected((err) => {
                    console.error('Failed to copy secret code', err);
                    return 'Failed to copy secret code';
                  }),
                );
            }}
          >
            {isCopied ? 'Copied!' : 'Copy'}
          </UiSubmitButton>
          <UiSubmitButton
            onClick={() => {
              setSaveBtnClicked(true);
              downloadFile(
                infoToSave,
                `idena-atomic-dex.${dayjs().format('YYYY-MM-DDTHH-mm-ss')}.txt`,
                'plain/text',
              );
            }}
            fullWidth
            size="medium"
          >
            Save as file
          </UiSubmitButton>
        </Stack>
      )}
      <FormControlLabel
        sx={{ mt: 1 }}
        control={
          <Checkbox
            disabled={!isCopyBtnClicked && !saveBtnClicked}
            checked={isSaved}
            onChange={() => setIsSaved(!isSaved)}
          />
        }
        label="I confirm that I have saved the secret in a safe place."
      />
    </UiBlock>
  );
};
