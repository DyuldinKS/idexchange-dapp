import { Link, useTheme } from '@mui/material';
import { APP_CONFIG } from '../app.config';
import { UiBlock, UiBlockTitle, UiInfoBlockContent, UiInfoBlockRow, UiSpan } from './ui';

export const SellerInfoBlock = () => {
  const tgUrl = APP_CONFIG.telegramNotificationBotUrl;
  const { palette } = useTheme();

  const info = (
    <UiSpan>
      After placing and confirming an order you will have to track your order status and react
      timely. By default your order will be active for the next ~600 Idena blocks after the creation
      that approximately equals to 3 hours. After that time if your order hasn't been matched you
      will be able to withdraw deposited funds. Once someone matches your order by depositing xDAI
      on Gnosis chain you will have 29 min to claim xDAI by revealing the secret, otherwise your
      security deposit will be seized. Subscribe to this Telegram channel to receive order status
      notifications:{' '}
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
