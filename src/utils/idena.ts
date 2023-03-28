import {
  ContractArgumentFormat as CAF,
  TransactionType,
  CallContractAttachment,
  ContractArgument,
  Transaction,
  toHexString,
  JsonBlock,
} from 'idena-sdk-js';
import { APP_CONFIG } from '../app.config';
import { CONTRACTS } from '../constants/contracts';
import { formatUnits, keccak256, parseUnits } from 'ethers/lib/utils.js';
import debug from 'debug';
import idenaProvider from '../providers/idenaProvider';

export type IdenaOrderState = NonNullable<Awaited<ReturnType<typeof getIdenaOrderState>>>;
export type IdenaContractStaticInfo = Awaited<ReturnType<typeof readIdenaContractInfo>>;

const log = debug('utils:idena');

const MAX_FEE = '3';
const IDENA_CONF = APP_CONFIG.idena;
export const MIN_IDNA_AMOUNT_TO_SELL = 100;
export const IDENA_BLOCK_DURATION_MS = 20000;
export const IDENA_DECIMALS = 18;

export const IDENA_CHAIN = {
  name: 'Idena',
  nativeCurrency: {
    decimals: IDENA_DECIMALS,
    name: 'Idena',
    symbol: 'iDNA',
  },
};

// TODO: make idena-sdk-js fix PR
// idena-sdk-js uses wrong case of writeBigUInt64LE method. It is supported by nodejs, but not supported by browsers.
globalThis.Buffer.prototype.writeBigUint64LE = Buffer.prototype.writeBigUInt64LE;

const contractAddress = CONTRACTS.idena.sellIdna;

export const isNilData = (err: any) => /data is nil/.test(err?.message || String(err));

export const handleNilData =
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
    idenaProvider.Blockchain.lastBlock() as Promise<JsonBlock & { timestamp: number }>,
  ] as const).catch(handleNilData('getIdenaOrderState'));

  if (!res) return null;

  const lastBlock = res[7];

  const getExpireTime = (block: string) =>
    (Number(block) - lastBlock.height) * IDENA_BLOCK_DURATION_MS + lastBlock.timestamp * 1000;

  const expirationBlock = res[4];
  const matchExpirationBlock = res[6];

  return {
    owner: res[0],
    payoutAddress: res[1],
    amountDna: res[2],
    amountXdai: res[3],
    expirationBlock,
    matcher: res[5],
    matchExpirationBlock,
    expireAt: getExpireTime(expirationBlock),
    matchExpireAt: matchExpirationBlock && getExpireTime(matchExpirationBlock),
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
  ttlMs: number,
) => {
  const lastBlock = await idenaProvider.Blockchain.lastBlock();
  const deadline = Number(lastBlock.height) + Math.ceil(ttlMs / IDENA_BLOCK_DURATION_MS);

  const createOrderCallPayload = new CallContractAttachment({
    method: 'createOrder',
    args: [],
  });
  const args = [
    { format: CAF.Dna, value: xDaiAmount },
    { format: CAF.Uint64, value: String(deadline) },
    { format: CAF.Hex, value: from },
    { format: CAF.Hex, value: secretHashHex },
  ];
  log('buildCreateIdenaOrderTx lastBlock', lastBlock, 'args', args);
  createOrderCallPayload.setArgs(buildContractArgs(args));

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
  window.open(getIdenaLinkToSignTx(tx), '_blank', 'noopener,noreferrer')?.focus();
};

export const readIdenaContractInfo = () => {
  // it is impossible to read idena contract attributes
  const minOrderTTL = 3 * 60 * 60; // 3h
  const minOrderTTLInBlocks = minOrderTTL / IDENA_BLOCK_DURATION_MS;

  return {
    minOrderTTL,
    minOrderTTLInBlocks,
    minAmount: parseUnits('100.0', IDENA_DECIMALS),
    fulfilPeriodInBlocks: 3600 / 20,
    requiredSecurityDepositAmount: parseUnits('10.0', IDENA_DECIMALS),
  };
};

export async function readIdenaSecurityDeposit(address: string) {
  const [amount, isInUse] = await Promise.all([
    safeReadMapNils(contractAddress, 'getDeposit', address, CAF.Dna),
    safeReadMapNils(contractAddress, 'isDepositInUse', address, CAF.String),
  ] as const);

  const amountBN = parseUnits(amount || '0', IDENA_DECIMALS);
  const { requiredSecurityDepositAmount } = readIdenaContractInfo();

  return {
    amount: amountBN,
    isInUse: Boolean(isInUse),
    isValid: Boolean(amount && requiredSecurityDepositAmount.eq(amountBN)),
    requiredAmount: requiredSecurityDepositAmount,
  };
}

export const buildTopUpIdenaSecurityDepositTx = async (from: string) => {
  const createOrderCallPayload = new CallContractAttachment({
    method: 'submitSecurityDeposit',
    args: [],
  });
  const txData = {
    from,
    to: contractAddress,
    type: TransactionType.CallContractTx,
    amount: formatUnits(readIdenaContractInfo().requiredSecurityDepositAmount, IDENA_DECIMALS),
    payload: createOrderCallPayload.toBytes(),
    maxFee: MAX_FEE,
  };
  const tx = await idenaProvider.Blockchain.buildTx(txData);
  await estimateWriteTx(tx, from);
  return tx;
};
