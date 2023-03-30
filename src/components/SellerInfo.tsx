import { UiBlock, UiBlockTitle, UiInfoBlockContent, UiInfoBlockRow } from './ui';

export const SellerInfoBlock = () => {
  const info =
    'After placing and confirming an order you will have to track your order status and react timely. ' +
    'By default your order will be active for the next ~600 Idena blocks after the creation that approximately equals to 3 hours. ' +
    "After that time if your order hasn't been matched you will be able to withdraw deposited funds. " +
    'Once someone matches your order by depositing XDAI on Gnosis chain you will have 29 min to claim XDAI by revealing the secret, otherwise your security deposit will be seized. ' +
    'Subscribe to this Telegram channel to receive order status notifications: https://t.me/+0etEyXyNdfQzYzdi';

  return (
    <UiBlock mt={4}>
      <UiBlockTitle>Note</UiBlockTitle>
      <UiInfoBlockContent>
        <UiInfoBlockRow label={info} value="" />
      </UiInfoBlockContent>
    </UiBlock>
  );
};
