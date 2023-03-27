import {
  ContractArgumentFormat as CAF,
  TransactionType,
  IdenaProvider,
  CallContractAttachment,
  ContractArgument,
  Transaction,
  toHexString,
} from 'idena-sdk-js';
import { APP_CONFIG } from '../app.config';
import { CONTRACTS } from '../constants/contracts';
import { keccak256 } from 'ethers/lib/utils.js';

export type IdenaOrderState = NonNullable<Awaited<ReturnType<typeof getIdenaOrderState>>>;
export type IdenaContractStaticInfo = Awaited<ReturnType<typeof readIdenaContractInfo>>;

const MAX_FEE = '3';
const IDENA_CONF = APP_CONFIG.idena;
export const MIN_IDNA_AMOUNT_TO_SELL = 100;
export const IDENA_BLOCK_DURATION_MS = 20000;

// TODO: make idena-sdk-js fix PR
// idena-sdk-js uses wrong case of writeBigUInt64LE method. It is supported by nodejs, but not supported by browsers.
globalThis.Buffer.prototype.writeBigUint64LE = Buffer.prototype.writeBigUInt64LE;

export const idenaProvider = IdenaProvider.create(IDENA_CONF.rpcUrl, IDENA_CONF.apiKey);

const contractAddress = CONTRACTS.idena.sellIdna;

export const isNilData = (err: any) => /data is nil/.test(err?.message || String(err));

const handleNilData =
  (prefix = '') =>
  (err: any) => {
    if (isNilData(err)) return null;
    console.error('handleNilData:', prefix, err);
    throw err;
  };

export async function getIdenaOrderState(secretHash: string) {
  const { Contract } = idenaProvider;
  const res = await Promise.all([
    Contract.readMap(contractAddress, 'getOwner', secretHash, CAF.Hex),
    Contract.readMap(contractAddress, 'getPayoutAddresses', secretHash, CAF.Hex),
    Contract.readMap(contractAddress, 'getAmountDNA', secretHash, CAF.Dna),
    Contract.readMap(contractAddress, 'getAmountXDAI', secretHash, CAF.Dna),
    Contract.readMap(contractAddress, 'getExpirationBlock', secretHash, CAF.Uint64),
    safeReadMapNils(contractAddress, 'getMatcher', secretHash, CAF.Hex),
    safeReadMapNils(contractAddress, 'getMatchExpirationBlock', secretHash, CAF.Uint64),
    idenaProvider.Blockchain.lastBlock().then((lastBlock) => ({
      lastBlock,
      timestamp: Date.now(),
    })),
  ] as const).catch(handleNilData('getIdenaOrderState'));

  if (!res) return null;

  const { lastBlock, timestamp } = res[7];
  const expirationBlock = Number(res[4]);
  return {
    owner: res[0],
    payoutAddress: res[1],
    amountDna: res[2],
    amountXdai: res[3],
    expirationBlock,
    matcher: res[5],
    matchExpirationBlock: res[6],
    expirationAt: (expirationBlock - lastBlock.height) * IDENA_BLOCK_DURATION_MS + timestamp,
  };
}

async function safeReadMapNils(contractAddress: string, method: string, key: string, type: CAF) {
  return idenaProvider.Contract.readMap(contractAddress, method, key, type).catch(
    handleNilData(`safeReadMapNils ${contractAddress} ${method} ${key}`),
  );
}

const buildContractArgs = (args: Omit<ContractArgument, 'index'>[]): ContractArgument[] =>
  args.map((arg, i) => ({ ...arg, index: i }));

const estimateWriteTx = async (tx: Transaction, sender: string) =>
  idenaProvider.Blockchain.doRequest({
    method: 'bcn_estimateRawTx',
    params: [tx.toHex(true), sender],
  });

export const buildCreateIdenaOrderTx = async (
  from: string,
  idnaAmount: string,
  xDaiAmount: string,
  secretHashHex: string,
) => {
  const lastBlock = await idenaProvider.Blockchain.lastBlock();
  const deadline = Number(lastBlock.height) + 600;

  const createOrderCallPayload = new CallContractAttachment({
    method: 'createOrder',
    args: [],
  });
  createOrderCallPayload.setArgs(
    buildContractArgs([
      { format: CAF.Dna, value: xDaiAmount },
      { format: CAF.Uint64, value: String(deadline) },
      { format: CAF.Hex, value: from },
      { format: CAF.Hex, value: secretHashHex },
    ]),
  );

  const txData = {
    from,
    to: contractAddress,
    type: TransactionType.CallContractTx,
    amount: idnaAmount,
    payload: createOrderCallPayload.toBytes(),
    maxFee: MAX_FEE,
  };
  const tx = await idenaProvider.Blockchain.buildTx(txData);
  await estimateWriteTx(tx, from);
  return tx;
};

export const buildBurnIdenaOrderTx = async (from: string, secretHashHex: string) => {
  const createOrderCallPayload = new CallContractAttachment({
    method: 'burnOrder',
    args: [],
  });
  createOrderCallPayload.setArgs(buildContractArgs([{ format: CAF.Hex, value: secretHashHex }]));
  const txData = {
    from,
    to: contractAddress,
    type: TransactionType.CallContractTx,
    payload: createOrderCallPayload.toBytes(),
    maxFee: MAX_FEE,
  };
  const tx = await idenaProvider.Blockchain.buildTx(txData);
  await estimateWriteTx(tx, from);
  return tx;
};

export const getIdenaLinkToSignTx = (rawTx: Transaction) =>
  `${IDENA_CONF.webAppOrigin}/dna/raw?tx=${rawTx.toHex(true)}&callback_url=${encodeURIComponent(
    IDENA_CONF.callbackUrl,
  )}&callback_format=html`;

export const generateRandomSecret = () => {
  const secretBytes = crypto.getRandomValues(new Uint8Array(IDENA_CONF.secretBytesLength));
  return toHexString(secretBytes, true);
};

export const getSecretHash = (secret: string) => keccak256(secret);

export const openIdenaAppToSignTx = (tx: Transaction) => {
  window.open(getIdenaLinkToSignTx(tx), '_blank')?.focus();
};

export const readIdenaContractInfo = async () => {
  const { Contract } = idenaProvider;
  const res = await Promise.all([
    Contract.readData(contractAddress, 'minAmount', CAF.Bigint),
    Contract.readData(contractAddress, 'minOrderTTLInBlocks', CAF.Uint64),
    Contract.readData(contractAddress, 'fulfillPeriodInBlocks', CAF.Uint64),
    Contract.readData(contractAddress, 'requiredSecurityDepositAmount', CAF.Uint64),
  ] as const);

  return {
    minAmount: res[0],
    minOrderTTLInBlocks: res[1],
    fulfillPeriodInBlocks: res[2],
    requiredSecurityDepositAmount: res[3],
  };
};
