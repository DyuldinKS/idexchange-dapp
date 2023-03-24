import { WalletConnector } from './components/WalletConnector';
import { z } from 'zod';
import { OrderCreationPage } from './components/OrderCreationPage';
import { APP_CONFIG } from './app.config';
import { lazy, Suspense } from 'react';

export type OrderCreationFormSchema = z.infer<typeof orderCreationFormSchema>;

const DebugTools = lazy(() => import('./components/DebugTools'));
const LazyDebugTools = () => (
  <Suspense>
    <DebugTools />
  </Suspense>
);

const orderCreationFormSchema = z.object({
  amountToSell: z
    .string()
    .refine((arg) => Number(arg) > 0, { message: 'should be a positive number' }),
  amountToBuy: z
    .string()
    .refine((arg) => Number(arg) > 0, { message: 'should be a positive number' }),
  secret: z.string().nonempty().min(12),
});

function App() {
  return (
    <div className="App">
      <WalletConnector />
      {APP_CONFIG.devMode && <LazyDebugTools />}
      <OrderCreationPage />
    </div>
  );
}

export default App;
