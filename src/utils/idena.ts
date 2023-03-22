import {
  ContractArgumentFormat,
  TransactionType,
  IdenaProvider,
  CallContractAttachment,
  hexToUint8Array,
  ContractArgument,
  Transaction,
} from 'idena-sdk-js';
import { APP_CONFIG } from '../app.config';
import { CONTRACTS } from '../constants/contracts';
import { keccak256 } from 'ethers/lib/utils.js';

const MAX_FEE = '3';
const IDENA_CONF = APP_CONFIG.idena;

// TODO: make idena-sdk-js fix PR
// idena-sdk-js uses wrong case of writeBigUInt64LE method. It is supported by nodejs, but not supported by browsers.
globalThis.Buffer.prototype.writeBigUint64LE = Buffer.prototype.writeBigUInt64LE;

export const idenaProvider = IdenaProvider.create(IDENA_CONF.rpcUrl, IDENA_CONF.apiKey);

// idenaProvider.Dna.balance('0x75d6cE9A43A681BD21B79ccB148C07DA65345072').then((res) =>
//   console.log('>>> dnaProvider.balance', res),
// );

const contractAddress = CONTRACTS.idena.sellIdna;

async function getOrderState(secretHash: string) {
  const [
    owner,
    payoutAddress,
    amountDNA,
    amountXDAI,
    expirationBlock,
    matcher,
    matchExpirationBlock,
  ] = await Promise.all([
    tryReadMap(contractAddress, 'getOwner', secretHash, ContractArgumentFormat.Hex), // address == hex or string?
    tryReadMap(contractAddress, 'getPayoutAddresses', secretHash, ContractArgumentFormat.Hex),
    tryReadMap(contractAddress, 'getAmountDNA', secretHash, ContractArgumentFormat.Dna),
    tryReadMap(contractAddress, 'getAmountXDAI', secretHash, ContractArgumentFormat.Dna),
    tryReadMap(contractAddress, 'getExpirationBlock', secretHash, ContractArgumentFormat.Uint64),
    tryReadMap(contractAddress, 'getMatcher', secretHash, ContractArgumentFormat.Hex),
    tryReadMap(
      contractAddress,
      'getMatchExpirationBlock',
      secretHash,
      ContractArgumentFormat.Uint64,
    ),
  ]);

  return {
    owner,
    payoutAddress,
    amountDNA,
    amountXDAI,
    expirationBlock,
    matcher,
    matchExpirationBlock,
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
    console.error('>>> tryReadMap error', e);
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

const createOrderToSellIdnaTx = async (
  from: string,
  idnaAmount: string,
  xDaiAmount: string,
  secretHex: string,
) => {
  const secretBytes = hexToUint8Array(secretHex);
  const lastBlock = await idenaProvider.Blockchain.lastBlock();
  const deadline = Number(lastBlock.height) + 600;
  const secretHash = keccak256(secretHex);

  const infoToLog = { secretHex, secretHash, deadline, lastBlock };
  console.log('>>> createOrderToSellIdna', infoToLog, JSON.stringify(infoToLog));

  const createOrderCallPayload = new CallContractAttachment({
    method: 'createOrder',
    args: [],
  });
  createOrderCallPayload.setArgs(
    buildContractArgs([
      {
        format: ContractArgumentFormat.Dna,
        value: xDaiAmount,
      },
      {
        format: ContractArgumentFormat.Uint64,
        value: String(deadline),
      },
      {
        format: ContractArgumentFormat.Hex,
        value: from,
      },
      {
        format: ContractArgumentFormat.Hex,
        value: secretHash,
      },
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
  console.log('>>> tx', tx);
  const res = await estimateWriteTx(tx, from);
  console.log('>>> res', res, tx.maxFee);
  return tx;
};

(window as any).createOrderToSellIdna = createOrderToSellIdnaTx;

export const getIdenaLinkToSignTx = (rawTx: Transaction) =>
  `${IDENA_CONF.webAppOrigin}/dna/raw?tx=${rawTx.toHex(true)}&callback_url=${encodeURIComponent(
    IDENA_CONF.callbackUrl,
  )}&callback_format=html`;
