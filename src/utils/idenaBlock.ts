import idenaProvider from '../providers/idenaProvider';

export const idenaLastBlock: {
  number: number;
  timestamp: number;
  promise: Promise<any> | null;
} = {
  number: 0,
  timestamp: 0,
  promise: null,
};

// move to react component
setInterval(() => {
  syncBlockTime();
}, 20_000);

syncBlockTime();

function syncBlockTime() {
  idenaLastBlock.promise = syncPromise();
}

async function syncPromise() {
  const block = await idenaProvider.Blockchain.lastBlock();
  idenaLastBlock.number = block.height;
  idenaLastBlock.timestamp = (block as any).timestamp * 1000;
}
