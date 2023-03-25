import { Box, Container, useTheme } from '@mui/material';

import { UiLogo } from './ui';

export const Header = () => {
  const theme = useTheme();
  return (
    <Box sx={{ bgcolor: theme.palette.grey[100], py: 0.5 }}>
      <Container maxWidth="sm">
        <UiLogo />
      </Container>
    </Box>
  );
};
