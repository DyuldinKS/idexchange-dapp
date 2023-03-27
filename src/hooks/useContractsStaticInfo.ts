import { useEffect } from 'react';
import { IdenaContractStaticInfo, readIdenaContractInfo } from '../utils/idena';
import { RemoteData } from '../utils/remoteData';
import { readXdaiContractInfo, XdaiContractStaticInfo } from '../utils/xdai';
import { useRemoteData } from './useRemoteData';

export type ContractsStaticInfo = {
  xdai: XdaiContractStaticInfo;
  idena: IdenaContractStaticInfo;
};

let res: RemoteData<ContractsStaticInfo>;

export const useContractsStaticInfo = () => {
  const [rd, rdm] = useRemoteData<ContractsStaticInfo>(null);

  useEffect(() => {
    const readStaticInfo = async () => {
      const [xdai, idena] = await Promise.all([
        readXdaiContractInfo(),
        readIdenaContractInfo(),
      ] as const);
      return { xdai, idena };
    };
    rdm.track(readStaticInfo());
  }, []);

  useEffect(() => {
    if (rd.data) {
      res = rd;
    }
  }, [rd]);

  // TODO: remove this kind of memoization, move the data to store
  return res || rd;
};
