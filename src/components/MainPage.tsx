import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Grid, Stack, TextField, Typography, useTheme } from '@mui/material';
import { isHexString } from 'ethers/lib/utils.js';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { APP_CONFIG } from '../app.config';
import { getSecretHash } from '../utils/idena';
import { OrderList } from './OrderList';
import { UiPage, UiSubmitButton } from './ui';

export type OrderSearchSchema = z.infer<typeof orderSearchSchema>;

const orderSearchSchema = z.object({
  orderId: z
    .string()
    .refine((val) => isHexString(val, 32) || isHexString(val, APP_CONFIG.idena.secretBytesLength), {
      message: 'The order id is expected to be a hex string.',
    }),
});

export const MainPage = () => {
  const theme = useTheme();
  const form = useForm<OrderSearchSchema>({
    resolver: zodResolver(orderSearchSchema),
    defaultValues: {
      orderId: '',
    },
    mode: 'onChange',
  });
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;
  const handleFindOrder = handleSubmit(({ orderId }) => {
    const secretHash = isHexString(orderId, 32) ? orderId : getSecretHash(orderId);
    navigate(`/order/${secretHash}`);
  });

  return (
    <UiPage maxWidth="sm">
      <Stack>
        <Stack>
          <UiSubmitButton size="large" LinkComponent={Link} {...{ to: '/order/new' }}>
            Exchange iDNA for xDAI
          </UiSubmitButton>
        </Stack>
        <Stack mt={2}>
          <UiSubmitButton
            variant="outlined"
            size="large"
            LinkComponent={Link}
            {...{ to: '/deposits' }}
          >
            Manage security deposits
          </UiSubmitButton>
        </Stack>
        <Stack mt={2}>
          <Box>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={8}>
                <TextField
                  {...register('orderId')}
                  error={Boolean(errors.orderId)}
                  helperText={errors.orderId?.message}
                  placeholder="Order id or secret"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <UiSubmitButton
                  fullWidth
                  sx={{ height: '40px' }}
                  variant="outlined"
                  onClick={handleFindOrder}
                >
                  Find order
                </UiSubmitButton>
              </Grid>
            </Grid>
          </Box>
        </Stack>

        <Stack mt={4}>
          <OrderList />
        </Stack>
      </Stack>
    </UiPage>
  );
};
