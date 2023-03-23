import {
  ContractArgumentFormat,
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

export type IdnaOrderState = Awaited<ReturnType<typeof getIdnaOrderState>>;

const MAX_FEE = '3';
const IDENA_CONF = APP_CONFIG.idena;
export const MIN_IDNA_AMOUNT_TO_SELL = 100;
export const IDENA_BLOCK_DURATION_MS = 20000;

// TODO: make idena-sdk-js fix PR
// idena-sdk-js uses wrong case of writeBigUInt64LE method. It is supported by nodejs, but not supported by browsers.
globalThis.Buffer.prototype.writeBigUint64LE = Buffer.prototype.writeBigUInt64LE;

export const idenaProvider = IdenaProvider.create(IDENA_CONF.rpcUrl, IDENA_CONF.apiKey);

// idenaProvider.Dna.balance('0x75d6cE9A43A681BD21B79ccB148C07DA65345072').then((res) =>
//   console.log('>>> dnaProvider.balance', res),
// );

const contractAddress = CONTRACTS.idena.sellIdna;

export async function getIdnaOrderState(secretHash: string) {
  const res = await Promise.all([
    idenaProvider.Contract.readMap(
      contractAddress,
      'getOwner',
      secretHash,
      ContractArgumentFormat.Hex,
    ),
    idenaProvider.Contract.readMap(
      contractAddress,
      'getPayoutAddresses',
      secretHash,
      ContractArgumentFormat.Hex,
    ),
    idenaProvider.Contract.readMap(
      contractAddress,
      'getAmountDNA',
      secretHash,
      ContractArgumentFormat.Dna,
    ),
    idenaProvider.Contract.readMap(
      contractAddress,
      'getAmountXDAI',
      secretHash,
      ContractArgumentFormat.Dna,
    ),
    idenaProvider.Contract.readMap(
      contractAddress,
      'getExpirationBlock',
      secretHash,
      ContractArgumentFormat.Uint64,
    ),
    // TODO: remove tryReadMap
    tryReadMap(contractAddress, 'getMatcher', secretHash, ContractArgumentFormat.Hex),
    tryReadMap(
      contractAddress,
      'getMatchExpirationBlock',
      secretHash,
      ContractArgumentFormat.Uint64,
    ),
    idenaProvider.Blockchain.lastBlock().then((lastBlock) => ({
      lastBlock,
      timestamp: Date.now(),
    })),
  ] as const);
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

async function tryReadMap(
  contractAddress: string,
  method: string,
  key: string,
  type: ContractArgumentFormat,
) {
  try {
    return await idenaProvider.Contract.readMap(contractAddress, method, key, type);
  } catch (e) {
    console.error('>>> tryReadMap error', method, key, type, e);
    return null;
  }
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
  secretHex: string,
) => {
  const lastBlock = await idenaProvider.Blockchain.lastBlock();
  const deadline = Number(lastBlock.height) + 600;
  const secretHash = getSecretHash(secretHex);

  const createOrderCallPayload = new CallContractAttachment({
    method: 'createOrder',
    args: [],
  });
  createOrderCallPayload.setArgs(
    buildContractArgs([
      { format: ContractArgumentFormat.Dna, value: xDaiAmount },
      { format: ContractArgumentFormat.Uint64, value: String(deadline) },
      { format: ContractArgumentFormat.Hex, value: from },
      { format: ContractArgumentFormat.Hex, value: secretHash },
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
  createOrderCallPayload.setArgs(
    buildContractArgs([{ format: ContractArgumentFormat.Hex, value: secretHashHex }]),
  );
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
  const secretBytes = crypto.getRandomValues(new Uint8Array(24));
  return toHexString(secretBytes, true);
};

export const getSecretHash = (secret: string) => keccak256(secret);
