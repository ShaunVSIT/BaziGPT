import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getBaziReading } from './services/openai';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (newValue: Date | null) => {
    setBirthDate(newValue);
    setError(null);
    setReading(null); // Clear previous reading when date changes
  };

  const handleSubmit = async () => {
    if (!birthDate) {
      setError('Please select a birth date first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baziReading = await getBaziReading(birthDate);
      setReading(baziReading.reading);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating your reading.');
      setReading(null);
    } finally {
      setLoading(false);
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
                  format="yyyy-MM-dd"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      placeholder: "YYYY-MM-DD",
                      sx: { width: '100%', maxWidth: 300 }
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  You can type the date directly (YYYY-MM-DD) or use the calendar picker
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!birthDate || loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Generating Reading...' : 'Get Your Reading'}
                </Button>
              </Box>
            </Paper>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            {reading && !loading && (
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
