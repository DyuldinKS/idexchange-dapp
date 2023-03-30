import { Box, Button, Container, Grid, Stack, useTheme } from '@mui/material';
import { disconnect } from '@wagmi/core';
import { useWeb3Store } from '../providers/store/StoreProvider';
import { shortenHash } from '../utils/address';
import { getColor } from '../utils/theme';
import { web3Modal } from '../utils/web3Modal';

import { UiLogo, UiSpan } from './ui';

export const Header = () => {
  const theme = useTheme();
  const [{ address }] = useWeb3Store();
  return (
    <Box sx={{ bgcolor: theme.palette.grey[100], py: 0.5 }}>
      <Container maxWidth="sm">
        <Grid container>
          <Grid item sm={7} xs={12}>
            <UiLogo />
          </Grid>
          <Grid item sm={5} xs={12} alignContent="center">
            {
              <Stack
                height="100%"
                spacing={1}
                direction="row"
                justifyContent="right"
                alignItems="center"
              >
                {address ? (
                  <>
                    <UiSpan color={getColor.textGrey(theme)}>{shortenHash(address)}</UiSpan>
                    <Button size="small" variant="outlined" onClick={disconnect}>
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button size="small" variant="outlined" onClick={() => web3Modal.openModal()}>
                    Connect wallet
                  </Button>
                )}
              </Stack>
            }
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
