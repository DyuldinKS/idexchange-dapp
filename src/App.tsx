import { WalletConnector } from './components/WalletConnector';
import { z } from 'zod';
import { OrderCreationPage } from './components/OrderCreationPage';

export type OrderCreationFormSchema = z.infer<typeof orderCreationFormSchema>;

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
      <OrderCreationPage />
    </div>
  );
}

export default App;
