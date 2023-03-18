import { Breakpoint, Button, ButtonProps, Stack, styled } from '@mui/material';

export const UiPage = styled(Stack)<{
  width: Breakpoint | number | string;
}>(({ theme, width }) => {
  const breakpoint = theme.breakpoints.values[width as Breakpoint];
  return {
    maxWidth: typeof breakpoint === 'number' ? `${breakpoint}px` : width,
    alignItems: 'stretch',
    flexGrow: 1,
    margin: '5rem auto',
    padding: '0 1rem',
    minWidth: '280px',
    width: '100%',
  };
});

export const UiSubmitButton = (props: ButtonProps) => (
  <Button size="large" variant="outlined" {...props} />
);
