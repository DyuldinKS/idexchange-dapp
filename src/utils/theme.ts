import { createTheme, Theme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#225569',
    },
    secondary: {
      main: '#2cb3ae',
    },
    background: {
      default: '#f7f7f7',
    },
  },
  typography: {
    fontFamily: ['"Noto Sans","Source Sans Pro","Roboto","Helvetica","Arial",sans-serif'].join(','),
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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
  },
});

export const getColor = {
  textGrey: (theme: Theme) => theme.palette.grey[700],
  textLink: (theme: Theme) => theme.palette.secondary.dark,
};
