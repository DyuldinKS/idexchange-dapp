import { UiBlock, UiBlockTitle, UiInfoBlockContent, UiInfoBlockRow } from './ui';

export const BuyerInfoBlock = () => {

  const info = 'After matching an order the seller will have 29 min to claim XDAI by revealing the secret. ' +
    'After that you will have at least 15 min to provide the secret on Idena chain to claim IDNA, otherwise your security deposit will be burnt. ' +
    'Subscribe to this Telegram channel to receive order status notifications: https://t.me/+0etEyXyNdfQzYzdi';

  return (
    <UiBlock mt={4}>
      <UiBlockTitle>
        Note
      </UiBlockTitle>
      <UiInfoBlockContent>
        <UiInfoBlockRow label={info} value=""/>
      </UiInfoBlockContent>
    </UiBlock>
  );
};
