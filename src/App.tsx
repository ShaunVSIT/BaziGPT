import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff9800',
    },
    secondary: {
      main: '#f44336',
    },
  },
});

function App() {
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [reading, setReading] = useState<string | null>(null);

  const handleDateChange = async (newValue: Date | null) => {
    setBirthDate(newValue);
    if (newValue) {
      // TODO: Add API call to get Bazi reading
      const formattedDate = format(newValue, 'yyyy-MM-dd');
      setReading(`Loading Bazi reading for ${formattedDate}...`);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container maxWidth="md">
          <Box sx={{ my: 4 }}>
            <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
              BaziGPT
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
              Discover your Chinese Fortune Reading
            </Typography>

            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Enter your birth date
                </Typography>
                <DatePicker
                  label="Birth Date"
                  value={birthDate}
                  onChange={handleDateChange}
                  sx={{ width: '100%', maxWidth: 300 }}
                />
              </Box>
            </Paper>

            {reading && (
              <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Your Bazi Reading
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {reading}
                </Typography>
              </Paper>
            )}
          </Box>
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
