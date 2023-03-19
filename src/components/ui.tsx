import {
  Breakpoint,
  Button,
  ButtonProps,
  Stack,
  styled,
  Typography,
  TypographyProps,
} from '@mui/material';
import { FC, ReactNode } from 'react';

export const UiPage = styled(Stack)<{
  width: Breakpoint | number | string;
}>(({ theme, width }) => {
  const breakpoint = theme.breakpoints.values[width as Breakpoint];
  return {
    maxWidth: typeof breakpoint === 'number' ? `${breakpoint}px` : width,
    alignItems: 'stretch',
    flexGrow: 1,
    margin: '1rem auto',
    padding: '0 1rem',
    minWidth: '280px',
    width: '100%',
  };
});

export const UiSubmitButton = (props: ButtonProps) => (
  <Button size="large" variant="contained" {...props} />
);

export const UiLogo = () => (
  <Typography variant="h2" component="h1" color="#aaa" fontWeight="light">
    Idena atomic&nbsp;DEX
  </Typography>
);

export const UiError: FC<TypographyProps & { msg: ReactNode }> = ({ msg, ...typProps }) =>
  msg ? (
    <Typography color="error" {...typProps}>
      {msg}
    </Typography>
  ) : null;
