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
  Collapse,
  IconButton,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getBaziReading, getFollowUpAnswer } from './services/openai';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from '@vercel/analytics/react';
import TelegramIcon from '@mui/icons-material/Telegram';

// Add this custom X icon component
const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" />
  </svg>
);

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
  const [isMainReadingExpanded, setIsMainReadingExpanded] = useState(true);
  const [cachedAnswers, setCachedAnswers] = useState<Record<string, string>>({});

  const handleDateChange = (newValue: Date | null) => {
    setBirthDate(newValue);
    setError(null);
    setReading(null);
    setSelectedQuestion(null);
    setFollowUpAnswer(null);
    setCachedAnswers({});
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
    setError(null);
    setIsMainReadingExpanded(false);

    if (cachedAnswers[question]) {
      setFollowUpAnswer(cachedAnswers[question]);
      return;
    }

    setFollowUpLoading(true);

    try {
      const answer = await getFollowUpAnswer(birthDate, question);
      setFollowUpAnswer(answer);
      setCachedAnswers(prev => ({
        ...prev,
        [question]: answer
      }));
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
    setIsMainReadingExpanded(true);
    setCachedAnswers({});
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
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              align="center"
              sx={{
                mb: 4,
                fontSize: {
                  xs: '2.5rem',  // Mobile
                  sm: '3.5rem',  // Tablet
                  md: '3.75rem'  // Desktop
                },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: '0.5rem', sm: '1rem' }
              }}
            >
              <span style={{ fontSize: '0.9em' }}>🀄</span>
              BaziGPT
              <span style={{ fontSize: '0.9em' }}>🀄</span>
            </Typography>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              align="center"
              sx={{
                mb: 4,
                fontSize: {
                  xs: '1.2rem',
                  sm: '1.5rem'
                }
              }}
            >
              Discover your Chinese Fortune Reading (Powered by AI!)
            </Typography>

            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
              {!reading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
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
                        sx: {
                          width: '100%',
                          maxWidth: { xs: '100%', sm: 300 }
                        }
                      }
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      mt: -1,
                      mb: 1,
                      textAlign: 'center',
                      px: { xs: 2, sm: 0 }
                    }}
                  >
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
                      maxWidth: { xs: '100%', sm: 300 },
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
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      mt: -1,
                      mb: 1,
                      textAlign: 'center',
                      px: { xs: 2, sm: 0 }
                    }}
                  >
                    If not provided, noon (12:00) will be used as a reference point
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!birthDate || loading}
                    sx={{
                      mt: 2,
                      width: { xs: '100%', sm: 'auto' }
                    }}
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
                    sx={{
                      mt: 1,
                      width: { xs: '100%', sm: 'auto' }
                    }}
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
              <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      fontSize: {
                        xs: '1.5rem',
                        sm: '1.75rem'
                      },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <span role="img" aria-label="mahjong">🀄</span>
                    Your Bazi Reading
                  </Typography>
                  <IconButton
                    onClick={() => setIsMainReadingExpanded(!isMainReadingExpanded)}
                    sx={{
                      transform: isMainReadingExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
                      transition: 'transform 0.3s',
                      color: 'primary.main',
                      padding: '12px',
                      '& .MuiSvgIcon-root': {
                        fontSize: '2rem'
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255, 152, 0, 0.1)',
                      }
                    }}
                  >
                    {isMainReadingExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                <Collapse in={isMainReadingExpanded} timeout={300}>
                  <Box sx={{
                    mt: 1,
                    overflowX: 'hidden',
                    '& h3': {
                      fontSize: {
                        xs: '1.25rem',
                        sm: '1.5rem'
                      },
                      fontWeight: 600,
                      mt: 3,
                      mb: 2,
                      color: '#f44336',
                      pb: 1,
                      borderBottom: 2,
                      borderColor: '#f44336',
                      '&:first-of-type': {
                        mt: 0
                      }
                    },
                    '& .section-content': {
                      bgcolor: 'background.paper',
                      p: { xs: 2, sm: 3 },
                      borderRadius: 1,
                      mb: 4,
                      overflowWrap: 'break-word',
                      wordWrap: 'break-word',
                      hyphens: 'auto',
                      '& > :first-child': {
                        mt: 0
                      },
                      '& > :last-child': {
                        mb: 0
                      },
                      '&::after': {
                        content: '""',
                        display: 'block',
                        width: '100%',
                        height: '2px',
                        background: 'linear-gradient(to right, rgba(244,67,54,0.5), rgba(244,67,54,0.1))',
                        mt: 4,
                        mb: -2
                      },
                      '&:last-child::after': {
                        display: 'none'
                      },
                      '& > p': {
                        display: 'block',
                        mb: 2,
                        '& > span:first-of-type': {
                          color: '#ff9800',
                          fontWeight: 600,
                          display: 'block',
                          mb: 1
                        }
                      },
                      '& h4': {
                        fontSize: {
                          xs: '1.1rem',
                          sm: '1.25rem'
                        },
                        fontWeight: 600,
                        mt: 3,
                        mb: 2,
                        color: '#ff9800',
                        '&:contains("Favorable Elements:")': {
                          color: '#4caf50'
                        },
                        '&:contains("Unfavorable Elements:")': {
                          color: '#f44336'
                        }
                      },
                      '& li': {
                        display: 'block',
                        mb: 2,
                        pl: 0,
                        '& > span:first-of-type': {
                          color: '#ff9800',
                          fontWeight: 600,
                          display: 'inline-block',
                          mr: 1
                        }
                      },
                      '& p:not(h4 + p)': {
                        textAlign: 'justify',
                        lineHeight: 1.6,
                        mb: 2
                      }
                    },
                    '& ul': {
                      pl: { xs: 2, sm: 3 },
                      mb: 1,
                      listStyle: 'none',
                      '& li': {
                        position: 'relative',
                        '&::before': {
                          content: '"•"',
                          position: 'absolute',
                          left: '-1.2em',
                          color: 'primary.main'
                        }
                      }
                    },
                    '& li': {
                      mb: 0.5,
                      overflowWrap: 'break-word',
                      wordWrap: 'break-word',
                      hyphens: 'auto',
                      '& > span:first-of-type': {
                        color: '#ff9800',
                        fontWeight: 600,
                        display: 'inline-block',
                        marginRight: '0.5rem'
                      }
                    },
                    '& strong': {
                      color: 'primary.main'
                    },
                    '& p': {
                      mb: 1,
                      textAlign: 'justify',
                      fontSize: {
                        xs: '0.95rem',
                        sm: '1rem'
                      },
                      overflowWrap: 'break-word',
                      wordWrap: 'break-word',
                      hyphens: 'auto',
                      '&:last-child': {
                        mb: 0
                      }
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
                </Collapse>
              </Paper>
            )}

            {reading && !loading && (
              <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: {
                      xs: '1.5rem',
                      sm: '1.75rem'
                    },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2
                  }}
                >
                  <span role="img" aria-label="crystal ball">🔮</span>
                  Explore Further
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    textAlign: { xs: 'center', sm: 'left' }
                  }}
                >
                  Click on any aspect below to get more detailed insights about specific areas of your life.
                </Typography>
                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: { xs: 1, sm: 2 },
                  '& .MuiButton-root': {
                    flex: { xs: '1 1 calc(50% - 8px)', sm: '0 1 auto' }
                  }
                }}>
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
                      sx={{
                        position: 'relative',
                        paddingRight: cachedAnswers[question] ? '2rem' : undefined,
                        '&::after': cachedAnswers[question] ? {
                          content: '"✓"',
                          position: 'absolute',
                          right: '0.5rem',
                          color: 'primary.main',
                          fontSize: '1rem',
                          fontWeight: 'bold'
                        } : undefined,
                        ...(cachedAnswers[question] && selectedQuestion !== question && {
                          borderColor: 'primary.main',
                          color: 'primary.main'
                        })
                      }}
                    >
                      {question}
                    </Button>
                  ))}
                </Box>
                {selectedQuestion && (followUpAnswer || followUpLoading) && (
                  <Box sx={{
                    mt: 3,
                    p: { xs: 1.5, sm: 2 },
                    bgcolor: 'background.paper',
                    borderRadius: 1
                  }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      {selectedQuestion}
                    </Typography>
                    {followUpLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : followUpAnswer && (
                      <Box>
                        {followUpAnswer.split('\n').map((line, index) => {
                          // Handle section headers (Strengths, Challenges, etc.)
                          if (line.startsWith('- ') && line.includes('**')) {
                            const cleanLine = line.replace(/\*\*/g, '');
                            const match = cleanLine.match(/- (.*?):(.*)/);
                            if (!match) return null;
                            const [_, heading, content] = match;
                            return (
                              <Box key={index} sx={{ mb: 3 }}>
                                <Typography
                                  sx={{
                                    color: '#ff9800',
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    mb: 1
                                  }}
                                >
                                  {heading}
                                </Typography>
                                <Typography>
                                  {content}
                                </Typography>
                              </Box>
                            );
                          }

                          // Handle empty lines
                          if (line.trim() === '') {
                            return <Box key={index} sx={{ mb: 1 }} />;
                          }

                          // Handle regular text
                          return (
                            <Typography key={index} sx={{ mb: 1 }}>
                              {line}
                            </Typography>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            )}
          </Box>

          {/* Footer */}
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 3 },
              mt: 4,
              mb: 2,
              background: 'linear-gradient(to right, rgba(26,26,26,0.8), rgba(255,152,0,0.1))',
              borderLeft: '4px solid',
              borderColor: 'primary.main'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <Box>
                <Typography variant="h6" color="primary.main" gutterBottom>
                  About the Developer
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Built by Barnum, who loves tinkering with fun projects and exploring the intersection of ancient wisdom and modern tech. Just a dev having fun building cool stuff for others to try out! 🚀
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Built with React, Material-UI, and GPT-4
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton
                  href="https://twitter.com/0xBarnum"
                  target="_blank"
                  aria-label="X (formerly Twitter)"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    padding: '12px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: 'rgba(255, 152, 0, 0.1)',
                      transform: 'translateY(-2px)'
                    },
                    '& svg': {
                      width: '20px',
                      height: '20px',
                      color: 'white'
                    }
                  }}
                >
                  <XIcon />
                </IconButton>
                <IconButton
                  href="https://t.me/CryptoBarnum"
                  target="_blank"
                  aria-label="Telegram"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    padding: '12px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: 'rgba(255, 152, 0, 0.1)',
                      transform: 'translateY(-2px)'
                    },
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.5rem',
                      color: 'white'
                    }
                  }}
                >
                  <TelegramIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Container>
        <SpeedInsights />
        <Analytics />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
