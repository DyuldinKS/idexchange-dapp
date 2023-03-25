import { WalletConnector } from './components/WalletConnector';
import { z } from 'zod';
import { OrderCreationPage } from './components/OrderCreationPage';
import { APP_CONFIG } from './app.config';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Box, Container, Stack, styled, useTheme } from '@mui/material';
import { UiLogo } from './components/ui';

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

export const AppWrap = styled(Stack)(({ theme }) => {
  return {
    minWidth: '100%',
    minHeight: '100vh',
    alignItems: 'stretch',
    padding: '0 0 2.5rem',
    [theme.breakpoints.down('sm')]: {
      padding: '0 0 2.5rem',
    },
  };
});

const Header = () => {
  const theme = useTheme();
  return (
    <Box sx={{ bgcolor: theme.palette.grey[100], py: 0.5 }}>
      <Container maxWidth="sm">
        <UiLogo />
      </Container>
    </Box>
  );
};

const AppAsRoute = () => {
  return (
    <AppWrap>
      <Header />
      <Stack alignItems="stretch">
        <Outlet />
      </Stack>
    </AppWrap>
  );
};

function App() {
  return (
    <BrowserRouter>
      {/** renderless */}
      <WalletConnector />
      {APP_CONFIG.devMode && <LazyDebugTools />}
      {/** renderful */}
      <Routes>
        <Route path="/" element={<AppAsRoute />}>
          <Route path="order/new" element={<OrderCreationPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
