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
  Button,
  TextField,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getBaziReading, getFollowUpAnswer } from './services/openai';
import RefreshIcon from '@mui/icons-material/Refresh';

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
  const [birthTime, setBirthTime] = useState<string>('');
  const [reading, setReading] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (newValue: Date | null) => {
    setBirthDate(newValue);
    setError(null);
    setReading(null);
    setSelectedQuestion(null);
    setFollowUpAnswer(null);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBirthTime(event.target.value);
  };

  const handleSubmit = async () => {
    if (!birthDate) {
      setError('Please select a birth date first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baziReading = await getBaziReading(birthDate, birthTime || undefined);
      setReading(baziReading.reading);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating your reading.');
      setReading(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = async (question: string) => {
    if (!birthDate) return;

    setSelectedQuestion(question);
    setFollowUpLoading(true);
    setError(null);

    try {
      const answer = await getFollowUpAnswer(birthDate, question);
      setFollowUpAnswer(answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the answer.');
      setFollowUpAnswer(null);
    } finally {
      setFollowUpLoading(false);
    }
  };

  const handleRestart = () => {
    setBirthDate(null);
    setBirthTime('');
    setReading(null);
    setSelectedQuestion(null);
    setFollowUpAnswer(null);
    setError(null);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
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
              {!reading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Enter your birth date
                  </Typography>
                  <DatePicker
                    label="Birth Date"
                    value={birthDate}
                    onChange={handleDateChange}
                    format="dd-MM-yyyy"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        placeholder: "DD-MM-YYYY",
                        sx: { width: '100%', maxWidth: 300 }
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: -1, mb: 1 }}>
                    You can type the date directly (DD-MM-YYYY) or use the calendar picker
                  </Typography>
                  <TextField
                    label="Birth Time (Optional)"
                    type="time"
                    value={birthTime}
                    onChange={handleTimeChange}
                    InputLabelProps={{
                      shrink: true,
                      sx: { color: 'text.primary' }
                    }}
                    sx={{
                      width: '100%',
                      maxWidth: 300,
                      '& input': {
                        color: 'text.primary'
                      },
                      '& .MuiInputBase-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.main'
                        }
                      },
                      '& .MuiSvgIcon-root': {
                        color: theme.palette.primary.main
                      }
                    }}
                    helperText="If not provided, noon (12:00) will be used as a reference point"
                  />
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!birthDate || loading}
                    sx={{ mt: 2 }}
                  >
                    {loading ? 'Generating Reading...' : 'Get Your Reading'}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Birth Details
                  </Typography>
                  <Typography variant="body1" sx={{ textAlign: 'center' }}>
                    Date: {birthDate && formatDate(birthDate)}
                    {birthTime && (
                      <>
                        <br />
                        Time: {birthTime}
                      </>
                    )}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleRestart}
                    startIcon={<RefreshIcon />}
                    sx={{ mt: 1 }}
                  >
                    Start New Reading
                  </Button>
                </Box>
              )}
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
              <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Your Bazi Reading
                </Typography>
                <Box sx={{
                  '& h3': {
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    mt: 3,
                    mb: 2,
                    color: 'primary.main',
                    pb: 1,
                    borderBottom: 2,
                    borderColor: 'primary.main'
                  },
                  '& .section-content': {
                    bgcolor: 'background.paper',
                    p: 3,
                    borderRadius: 1,
                    mb: 4,
                    '& > :first-child': {
                      mt: 0
                    },
                    '& > :last-child': {
                      mb: 0
                    }
                  },
                  '& h4': {
                    fontSize: '1.25rem',
                    fontWeight: 500,
                    mt: 2,
                    mb: 1,
                    color: 'secondary.main'
                  },
                  '& ul': {
                    pl: 3,
                    mb: 1
                  },
                  '& li': {
                    mb: 0.5
                  },
                  '& strong': {
                    color: 'primary.main'
                  },
                  '& p': {
                    mb: 1,
                    textAlign: 'justify',
                    '&:last-child': {
                      mb: 0
                    }
                  },
                  '& br + br': {
                    display: 'none'
                  }
                }}>
                  <Typography
                    component="div"
                    sx={{
                      whiteSpace: 'pre-line',
                      '& > *:first-of-type': { mt: 0 }
                    }}
                  >
                    {reading.split('\n').map((line, index, lines) => {
                      if (line.startsWith('### ')) {
                        // Get content until next section
                        const contentLines = [];
                        for (let i = index + 1; i < lines.length; i++) {
                          if (lines[i].startsWith('### ')) break;
                          contentLines.push(lines[i]);
                        }

                        return (
                          <Box key={index}>
                            <Typography component="h3">{line.replace('### ', '')}</Typography>
                            <Box className="section-content">
                              {contentLines.map((contentLine, contentIndex) => {
                                if (contentLine.startsWith('#### ')) {
                                  return <Typography key={contentIndex} component="h4">{contentLine.replace('#### ', '')}</Typography>;
                                }
                                if (contentLine.startsWith('- ') || contentLine.startsWith('* ')) {
                                  const bulletContent = contentLine.replace(/^[-*]\s/, '');
                                  if (bulletContent.includes('**')) {
                                    const parts = bulletContent.split('**');
                                    return (
                                      <Typography key={contentIndex} component="li" sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                                        {parts.map((part, i) => {
                                          if (i % 2 === 1) {
                                            return (
                                              <Typography
                                                key={i}
                                                component="span"
                                                sx={{
                                                  color: 'primary.main',
                                                  fontWeight: 600,
                                                  display: 'inline',
                                                  mr: 1,
                                                  minWidth: '120px'
                                                }}
                                              >
                                                {part}
                                              </Typography>
                                            );
                                          }
                                          return <span key={i}>{part}</span>;
                                        })}
                                      </Typography>
                                    );
                                  }
                                  return <Typography key={contentIndex} component="li" sx={{ mb: 1 }}>{bulletContent}</Typography>;
                                }
                                if (contentLine.includes('**')) {
                                  const parts = contentLine.split('**');
                                  return (
                                    <Typography key={contentIndex} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                      {parts.map((part, i) => {
                                        if (i % 2 === 1) {
                                          return (
                                            <Typography
                                              key={i}
                                              component="span"
                                              sx={{
                                                color: 'primary.main',
                                                fontWeight: 600,
                                                display: 'inline',
                                                mr: 1
                                              }}
                                            >
                                              {part}
                                            </Typography>
                                          );
                                        }
                                        return <span key={i}>{part}</span>;
                                      })}
                                    </Typography>
                                  );
                                }
                                if (contentLine.trim() === '') {
                                  return <br key={contentIndex} />;
                                }
                                return <Typography key={contentIndex} sx={{ mb: 1, textAlign: 'justify' }}>{contentLine}</Typography>;
                              })}
                            </Box>
                          </Box>
                        );
                      }
                      return null;
                    })}
                  </Typography>
                </Box>
              </Paper>
            )}

            {reading && !loading && (
              <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Explore Further
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Click on any aspect below to get more detailed insights about specific areas of your life.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {[
                    "What about my health?",
                    "What about my love life?",
                    "What about my family?",
                    "What about my career?",
                    "What about my wealth?",
                    "What about my relationships?",
                    "What about my personal growth?",
                    "What about my spiritual journey?"
                  ].map((question, index) => (
                    <Button
                      key={index}
                      variant={selectedQuestion === question ? "contained" : "outlined"}
                      onClick={() => handleQuestionClick(question)}
                      disabled={followUpLoading}
                    >
                      {question}
                    </Button>
                  ))}
                </Box>
                {selectedQuestion && (followUpAnswer || followUpLoading) && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      {selectedQuestion}
                    </Typography>
                    {followUpLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : followUpAnswer && (
                      <Typography
                        component="div"
                        sx={{
                          whiteSpace: 'pre-line',
                          '& > *:first-of-type': { mt: 0 }
                        }}
                      >
                        {followUpAnswer.split('\n').map((line, index) => {
                          if (line.includes('**')) {
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                              <Typography key={index}>
                                {parts.map((part, i) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return (
                                      <Typography
                                        key={i}
                                        component="span"
                                        sx={{
                                          color: 'primary.main',
                                          fontWeight: 600,
                                          display: 'inline'
                                        }}
                                      >
                                        {part.slice(2, -2)}
                                      </Typography>
                                    );
                                  }
                                  return part;
                                })}
                              </Typography>
                            );
                          }
                          if (line.trim() === '') {
                            return <br key={index} />;
                          }
                          return <Typography key={index} sx={{ textAlign: 'justify' }}>{line}</Typography>;
                        })}
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            )}
          </Box>
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
