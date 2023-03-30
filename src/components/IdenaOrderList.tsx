import { Stack } from '@mui/system';
import { FC } from 'react';
import { useContractsAttributes } from '../hooks/useContractsAttributes';
import { canMatchOrder } from '../utils/orderControls';
import { IdenaOrderListState } from '../utils/orderList';
import { ShortOrderInfo } from './ShortOrderInfo';

export const IdenaOrderList: FC<{
  orders: IdenaOrderListState;
  currentTimestamp: number;
}> = ({ orders, currentTimestamp }) => {
  const { data: contractsAttrs } = useContractsAttributes();
  const validOrders =
    contractsAttrs &&
    orders.filter(({ xdaiState, dnaState }) =>
      canMatchOrder(dnaState, xdaiState, contractsAttrs.idena),
    );

  return (
    <Stack spacing={2}>
      {validOrders &&
        validOrders.map((x) => (
          <ShortOrderInfo
            key={x.hash}
            id={x.hash}
            dnaState={x.dnaState}
            xdaiState={x.xdaiState}
          ></ShortOrderInfo>
        ))}
    </Stack>
  );
};
