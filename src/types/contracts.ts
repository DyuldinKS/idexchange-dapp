import { BigNumber } from 'ethers';

export type SecurityDepositType = {
  amount: BigNumber;
  isInUse: boolean;
  requiredAmount: BigNumber;
  isValid: boolean;
};
