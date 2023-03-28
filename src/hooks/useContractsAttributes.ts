import { useEffect } from 'react';
import { IdenaContractStaticInfo, readIdenaContractInfo } from '../utils/idena';
import { RemoteData } from '../utils/remoteData';
import { readXdaiContractInfo, XdaiContractAttributes } from '../utils/xdai';
import { useRemoteData } from './useRemoteData';

export type ContractsStaticInfo = {
  xdai: XdaiContractAttributes;
  idena: IdenaContractStaticInfo;
};

let res: RemoteData<ContractsStaticInfo>;

export const useContractsAttributes = () => {
  const [rd, rdm] = useRemoteData<ContractsStaticInfo>(null);

  useEffect(() => {
    if (res) return;

    const readStaticInfo = async () => {
      const [xdai, idena] = await Promise.all([
        readXdaiContractInfo(),
        readIdenaContractInfo(),
      ] as const);
      return { xdai, idena };
    };
    rdm.track(readStaticInfo());
  }, []);

  // TODO: remove this kind of memoization, move the data to store
  if (rd.data && !res) {
    res = rd;
  }

  return res || rd;
};
