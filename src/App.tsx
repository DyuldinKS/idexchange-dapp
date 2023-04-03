import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { Stack, styled } from '@mui/material';

import { APP_CONFIG } from './app.config';
import { OrderCreationPage } from './components/OrderCreationPage';
import { WalletConnector } from './components/WalletConnector';
import { Header } from './components/Header';
import { MainPage } from './components/MainPage';
import { OrderPage } from './components/OrderPage';
import { DepositControlsPage } from './components/DepositControlsPage';

const DebugTools = lazy(() => import('./components/DebugTools'));
const LazyDebugTools = () => (
  <Suspense>
    <DebugTools />
  </Suspense>
);

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
          <Route index element={<MainPage />} />
          <Route path="order/new" element={<OrderCreationPage />} />
          <Route path="order/:hash" element={<OrderPage />} />
          <Route path="deposits" element={<DepositControlsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
