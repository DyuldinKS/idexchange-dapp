import dayjs from 'dayjs';
import { FC, useEffect, useState } from 'react';

import { Checkbox, FormControlLabel, Stack } from '@mui/material';

import { useRemoteData } from '../hooks/useRemoteData';
import { tapRejected } from '../utils/async';
import { downloadFile } from '../utils/misc';
import { rData } from '../utils/remoteData';
import { UiBlock, UiBlockTitle, UiInfoBlockContent, UiInfoBlockRow, UiSubmitButton } from './ui';
import { UseFormHandleSubmit, UseFormReturn } from 'react-hook-form';
import { OrderCreationFormSchema } from './OrderCreationPage';

export const SecretCodeForm: FC<{
  secret: string;
  secretHash: string;
  isSaved: boolean;
  setIsSaved: React.Dispatch<React.SetStateAction<boolean>>;
  form: UseFormReturn<OrderCreationFormSchema>;
}> = ({ secret, secretHash, isSaved, setIsSaved, form }) => {
  const [copyingRD, copyingRDM] = useRemoteData<boolean>(null);
  const [saveBtnClicked, setSaveBtnClicked] = useState(false);

  const isCopied = Boolean(copyingRD.data);
  const isCopyBtnClicked = !rData.isNotAsked(copyingRD);
  const idenaAddress = form.getValues('idenaAddress');

  useEffect(() => {
    if (isCopied) {
      const timerId = setTimeout(() => {
        copyingRDM.setSuccess(false);
      }, 2000);
      return () => clearTimeout(timerId);
    }
  }, [isCopied, copyingRDM]);

  useEffect(() => {
    setIsSaved(false);
    setSaveBtnClicked(false);
    copyingRDM.setNotAsked();
  }, [idenaAddress]);

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
        <UiInfoBlockRow label="Secret:" value={secret} />
        <UiInfoBlockRow label={<span>Order&nbsp;id:</span>} value={secretHash} />
      </UiInfoBlockContent>
      {!isSaved && (
        <Stack mt={2} direction="row" spacing={1}>
          <UiSubmitButton
            variant="outlined"
            fullWidth
            size="medium"
            disabled={isCopied}
            onClick={form.handleSubmit(({ idenaAddress }) => {
              const infoToSave = `Idena address: ${idenaAddress}\nSecret: ${secret}\nOrder id: ${secretHash}`;
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
            })}
          >
            {isCopied ? 'Copied!' : 'Copy'}
          </UiSubmitButton>
          <UiSubmitButton
            onClick={form.handleSubmit(({ idenaAddress }) => {
              setSaveBtnClicked(true);
              const postfix = idenaAddress.slice(0, 5);
              const infoToSave = `Idena address: ${idenaAddress}\nSecret: ${secret}\nOrder id: ${secretHash}`;
              downloadFile(
                infoToSave,
                `idena-atomic-dex.${dayjs().format('YYYY-MM-DDTHH-mm-ss')}.${postfix}.txt`,
                'plain/text',
              );
            })}
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
            onChange={() => setIsSaved((prev) => !prev)}
          />
        }
        label="I confirm that I have saved the secret in a safe place."
      />
    </UiBlock>
  );
};
