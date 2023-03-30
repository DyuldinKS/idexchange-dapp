import { Link, useTheme } from '@mui/material';
import { APP_CONFIG } from '../app.config';
import { UiBlock, UiBlockTitle, UiInfoBlockContent, UiInfoBlockRow, UiSpan } from './ui';

export const BuyerInfoBlock = () => {
  const tgUrl = APP_CONFIG.telegramNotificationBotUrl;
  const { palette } = useTheme();

  const info = (
    <UiSpan>
      After matching an order the seller will have 29 min to claim xDAI by revealing the secret.
      After that you will have at least 15 min to provide the secret on Idena chain to claim iDNA,
      otherwise your security deposit will be burnt. Subscribe to this Telegram channel to receive
      order status notifications:{' '}
      <Link target="_blank" color={palette.secondary.dark} href={tgUrl}>
        {tgUrl}
      </Link>
    </UiSpan>
  );

  return (
    <UiBlock mt={4}>
      <UiBlockTitle>Note</UiBlockTitle>
      <UiInfoBlockContent>
        <UiInfoBlockRow label={info} />
      </UiInfoBlockContent>
    </UiBlock>
  );
};
