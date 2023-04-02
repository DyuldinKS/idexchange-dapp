import {
  Box,
  BoxProps,
  Breakpoint,
  Button,
  ButtonProps,
  Container,
  Stack,
  styled,
  Tooltip,
  TooltipProps,
  Typography,
  TypographyProps,
  useTheme,
} from '@mui/material';
import { StackProps } from '@mui/system';
import { ComponentProps, FC, forwardRef, PropsWithChildren, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { FCC } from '../types/FCC';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils.js';

export const UiSubmitButton: FC<ButtonProps> = (props) => (
  <Button size="medium" variant="contained" {...props} />
);

export const UiLogo = () => (
  <RouterLink to="/">
    <Typography
      sx={{ textDecoration: 'none', fontSize: { sm: '2rem', xs: '1.8rem' } }}
      variant="h2"
      color="#aaa"
      fontWeight={200}
    >
      IDEXCHANGE
    </Typography>
  </RouterLink>
);

export const UiPage = styled(Container)({
  paddingTop: '2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
});

export const UiError: FC<TypographyProps & { err?: any; msg?: ReactNode }> = ({
  msg,
  err,
  ...typProps
}) => {
  const errText = err?.data?.message || err?.message || msg;
  return errText ? (
    <UiSpan color="error" {...typProps} sx={{ wordWrap: 'break-word', ...typProps.sx }}>
      {errText}
    </UiSpan>
  ) : null;
};

export const UiInputTooltipBtn = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
  color: theme.palette.grey[700],
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: '1.75rem',
  textAlign: 'center',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '0.875rem',
  cursor: 'pointer',
}));

export const UiLabel = forwardRef<
  HTMLLabelElement,
  PropsWithChildren<
    {
      label: string;
      required?: boolean;
      tooltip?: TooltipProps['title'];
      htmlFor?: string;
    } & Omit<TypographyProps, 'ref'>
  >
>(({ label, required, tooltip, children, ...props }, ref) => {
  return (
    <Typography
      variant="h3"
      component="label"
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        fontWeight: 500,
      }}
      fontSize="1.25rem"
      ref={ref}
      {...props}
    >
      <Box component="span" display="flex" alignItems="center" fontFamily="inherit" mb={2}>
        {label}
        {required && (
          <Box component="span" ml={1} fontFamily="Roboto">
            *
          </Box>
        )}
        {tooltip && (
          <Tooltip title={tooltip} placement="bottom-start">
            <UiInputTooltipBtn ml={1}>?</UiInputTooltipBtn>
          </Tooltip>
        )}
      </Box>
      {children}
    </Typography>
  );
});

UiLabel.displayName = 'UiLabel';

export const UiBlock = styled(Stack)(({ theme }) => ({
  padding: '1rem 1rem 1.25rem',
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  alignItems: 'stretch',
}));

export type UiBlockTitleProps = ComponentProps<typeof UiBlockTitle>;

export const UiBlockTitle: FCC<{ tooltip?: ReactNode } & TypographyProps> = ({
  tooltip,
  children,
  ...typProps
}) => {
  return (
    <Typography
      variant="h3"
      fontSize="1.25rem"
      display="flex"
      alignItems="center"
      fontWeight={500}
      {...typProps}
    >
      {children}
      {tooltip && (
        <Tooltip title={tooltip}>
          <UiInputTooltipBtn ml={1}>?</UiInputTooltipBtn>
        </Tooltip>
      )}
    </Typography>
  );
};

export const UiInfoBlockRow: FC<{ label: ReactNode; value?: ReactNode } & BoxProps> = ({
  label,
  value,
  ...props
}) => {
  const theme = useTheme();
  return (
    <Box component="span" {...props} sx={{ wordWrap: 'break-word' }}>
      <Box component="span" mr={1} color={theme.palette.grey[700]}>
        {label}
      </Box>
      {value && <Box component="span">{value}</Box>}
    </Box>
  );
};

export const UiInfoBlockTokenAmount: FC<{
  amount: BigNumber;
  decimals: number;
  symbol: string;
}> = ({ amount, decimals, symbol }) => (
  <UiSpan>
    <UiSpan fontWeight={600}>{formatUnits(amount, decimals)}</UiSpan> {symbol}
  </UiSpan>
);

export const UiInfoBlockContent: FCC<StackProps> = (props) => {
  return <Stack mt={2} spacing={1} {...props} />;
};

export const UiSpan: FCC<TypographyProps> = (props) => {
  return <Typography component="span" {...props} />;
};
