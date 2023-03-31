export const APP_CONFIG = {
  devMode: localStorage.devMode === 'true',
  walletConnect: {
    projectId: '995c625498beb452c9f03c654006ea87',
  },
  idena: {
    rpcUrl: 'https://restricted.idena.io',
    apiKey: 'idena-restricted-node-key',
    webAppOrigin: 'https://app.idena.io',
    callbackUrl: window.location.origin,
    secretBytesLength: 40,
  },
  telegramNotificationBotUrl: 'https://t.me/+0etEyXyNdfQzYzdi',
  orderPageStateReloadIntevalMs: 60000,
} as const;
