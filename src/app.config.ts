export const APP_CONFIG = {
  walletConnect: {
    projectId: '995c625498beb452c9f03c654006ea87',
  },
  idena: {
    rpcUrl: 'https://restricted.idena.io',
    apiKey: 'idena-restricted-node-key',
    webAppOrigin: 'https://app.idena.io',
    callbackUrl: window.location.origin,
  },
} as const;
