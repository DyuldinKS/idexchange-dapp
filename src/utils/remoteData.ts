export enum RemoteDataStatus {
  notAsked = 'notAsked',
  loading = 'loading',
  success = 'success',
  failure = 'failure',
}

export type RemoteDataNotAsked<InitialData> = {
  data: InitialData;
  error: null;
  status: RemoteDataStatus.notAsked;
};

export type RemoteDataLoading<InitialData> = {
  data: InitialData;
  error: null;
  status: RemoteDataStatus.loading;
};

export type RemoteDataFailure<InitialData, Err> = {
  data: InitialData;
  error: Err;
  status: RemoteDataStatus.failure;
};

export type RemoteDataSuccess<SuccessData> = {
  data: SuccessData;
  error: null;
  status: RemoteDataStatus.success;
};

export type RemoteData<SuccessData, InitialData = null, Err = any> =
  | RemoteDataNotAsked<InitialData>
  | RemoteDataLoading<InitialData>
  | RemoteDataFailure<InitialData, Err>
  | RemoteDataSuccess<SuccessData>;

const makeStatusGuard = <T extends RemoteDataStatus>(status: T) => {
  type Res<SuccessData, InitialData, Err> = T extends RemoteDataStatus.notAsked
    ? RemoteDataNotAsked<InitialData>
    : T extends RemoteDataStatus.loading
    ? RemoteDataLoading<InitialData>
    : T extends RemoteDataStatus.failure
    ? RemoteDataFailure<InitialData, Err>
    : RemoteDataSuccess<SuccessData>;

  return <SuccessData, InitialData, Err>(
    rData: RemoteData<SuccessData, InitialData, Err>,
  ): rData is Res<SuccessData, InitialData, Err> => rData.status === status;
};

/** Remote Data */
export const rData = {
  /* ------------------------------- factory methods ------------------------------- */

  makeNotAsked<InitialData>(data: InitialData): RemoteDataNotAsked<InitialData> {
    return { data, error: null, status: RemoteDataStatus.notAsked };
  },
  makeLoading<InitialData>(data: InitialData): RemoteDataLoading<InitialData> {
    return { data, error: null, status: RemoteDataStatus.loading };
  },
  makeSuccess<SuccessData>(data: SuccessData): RemoteDataSuccess<SuccessData> {
    return { data, error: null, status: RemoteDataStatus.success };
  },
  makeFailure<InitialData, Err>(
    error: Err,
    data: InitialData,
  ): RemoteDataFailure<InitialData, Err> {
    return { data, error, status: RemoteDataStatus.failure };
  },

  /* ----------------------------- status type guards ----------------------------- */

  isNotAsked: makeStatusGuard(RemoteDataStatus.notAsked),
  isLoading: makeStatusGuard(RemoteDataStatus.loading),
  isFailure: makeStatusGuard(RemoteDataStatus.failure),
  isSuccess: makeStatusGuard(RemoteDataStatus.success),
  isSuccessAll: (
    remoteDataList: RemoteData<unknown>[],
  ): remoteDataList is RemoteDataSuccess<unknown>[] => remoteDataList.every(rData.isSuccess),
};
