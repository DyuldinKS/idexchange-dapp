import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#607d8b',
    },
    secondary: {
      main: '#4db6ac',
    },
    background: {
      default: '#f7f7f7',
    },
  },
  typography: {
    h1: {
      fontSize: '3.2rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2.4rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.6rem',
    },
    h5: {
      fontSize: '1.4rem',
    },
    h6: {
      fontSize: '1.2rem',
    },
  },
});
