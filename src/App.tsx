import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Zoom,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getBaziReading, getFollowUpAnswer, getCompatibilityReading } from './services/openai';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics, track } from '@vercel/analytics/react';
import TelegramIcon from '@mui/icons-material/Telegram';
import InfoIcon from '@mui/icons-material/Info';
import ShareIcon from '@mui/icons-material/Share';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import SEOAnalytics from './components/SEOAnalytics';
import Privacy from './components/Privacy';
import Terms from './components/Terms';

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

interface BaziReading {
  reading: string;
  shareableSummary: string;
}

interface CompatibilityReading {
  reading: string;
  shareableSummary: string;
}

function MainApp() {
  const [readingMode, setReadingMode] = useState<'solo' | 'compatibility'>('solo');

  // Solo reading state
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [birthTime, setBirthTime] = useState<string>('');
  const [reading, setReading] = useState<BaziReading | null>(null);
  const [shareableSummary, setShareableSummary] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMainReadingExpanded, setIsMainReadingExpanded] = useState(true);
  const [cachedAnswers, setCachedAnswers] = useState<Record<string, string>>({});
  const [disclaimerOpen, setDisclaimerOpen] = useState(true);
  const [hasSeenDisclaimer, setHasSeenDisclaimer] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isBaziInfoExpanded, setIsBaziInfoExpanded] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Compatibility reading state
  const [person1BirthDate, setPerson1BirthDate] = useState<Date | null>(null);
  const [person1BirthTime, setPerson1BirthTime] = useState<string>('');
  const [person2BirthDate, setPerson2BirthDate] = useState<Date | null>(null);
  const [person2BirthTime, setPerson2BirthTime] = useState<string>('');
  const [compatibilityReading, setCompatibilityReading] = useState<CompatibilityReading | null>(null);
  const [compatibilityLoading, setCompatibilityLoading] = useState(false);
  const [compatibilityError, setCompatibilityError] = useState<string | null>(null);
  const [compatibilityShareDialogOpen, setCompatibilityShareDialogOpen] = useState(false);
  const compatibilityShareCardRef = useRef<HTMLDivElement>(null);

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
      setReading(baziReading);
      // Track successful reading generation
      track('reading_generated', {
        hasTime: !!birthTime,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating your reading.');
      setReading(null);
      // Track errors
      track('reading_error', {
        error: err instanceof Error ? err.message : 'Unknown error',
      });
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
      // Track cached answer usage
      track('followup_cached', {
        question,
      });
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
      // Track successful follow-up question
      track('followup_generated', {
        question,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the answer.');
      setFollowUpAnswer(null);
      // Track follow-up errors
      track('followup_error', {
        question,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setFollowUpLoading(false);
    }
  };

  const handleRestart = () => {
    // Track when users start over
    track('reading_restart');
    setBirthDate(null);
    setBirthTime('');
    setReading(null);
    setShareableSummary(null);
    setSelectedQuestion(null);
    setFollowUpAnswer(null);
    setError(null);
    setIsMainReadingExpanded(true);
    setCachedAnswers({});
  };

  // Compatibility functions
  const handlePerson1DateChange = (newValue: Date | null) => {
    setPerson1BirthDate(newValue);
    setCompatibilityError(null);
    setCompatibilityReading(null);
  };

  const handlePerson1TimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPerson1BirthTime(event.target.value);
  };

  const handlePerson2DateChange = (newValue: Date | null) => {
    setPerson2BirthDate(newValue);
    setCompatibilityError(null);
    setCompatibilityReading(null);
  };

  const handlePerson2TimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPerson2BirthTime(event.target.value);
  };

  const handleCompatibilitySubmit = async () => {
    if (!person1BirthDate || !person2BirthDate) {
      setCompatibilityError('Please select birth dates for both people');
      return;
    }

    setCompatibilityLoading(true);
    setCompatibilityError(null);

    try {
      const compatibilityReading = await getCompatibilityReading(
        person1BirthDate,
        person1BirthTime || undefined,
        person2BirthDate,
        person2BirthTime || undefined
      );
      setCompatibilityReading(compatibilityReading);

      // Track successful compatibility reading
      track('compatibility_generated', {
        hasPerson1Time: !!person1BirthTime,
        hasPerson2Time: !!person2BirthTime,
      });
    } catch (err) {
      setCompatibilityError(err instanceof Error ? err.message : 'An error occurred while generating the compatibility reading.');
      setCompatibilityReading(null);
      // Track errors
      track('compatibility_error', {
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setCompatibilityLoading(false);
    }
  };

  const handleCompatibilityRestart = () => {
    // Track when users start over
    track('compatibility_restart');
    setPerson1BirthDate(null);
    setPerson1BirthTime('');
    setPerson2BirthDate(null);
    setPerson2BirthTime('');
    setCompatibilityReading(null);
    setCompatibilityError(null);
  };





  const handleCompatibilityShareDownload = async () => {
    if (!compatibilityShareCardRef.current) return;

    try {
      const canvas = await html2canvas(compatibilityShareCardRef.current, {
        backgroundColor: '#121212',
        scale: 2,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'our-compatibility-reading.png';
      link.href = image;
      link.click();
      // Track successful shares
      track('compatibility_shared');
    } catch (err) {
      // Track share errors with Vercel Analytics instead of console.error
      track('compatibility_share_error', {
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const getCompatibilityShareableSummary = () => {
    return compatibilityReading?.shareableSummary || "This couple shows balanced compatibility with complementary strengths and areas for growth.";
  };

  const formatDate = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const handleCloseDisclaimer = () => {
    // Track disclaimer acceptance
    track('disclaimer_accepted');
    setDisclaimerOpen(false);
    setHasSeenDisclaimer(true);
  };

  const handleShare = async () => {
    if (!shareCardRef.current) return;

    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#121212',
        scale: 2,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'my-bazi-reading.png';
      link.href = image;
      link.click();
      // Track successful shares
      track('reading_shared');
    } catch (err) {
      // Track share errors with Vercel Analytics instead of console.error
      track('share_error', {
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const renderShareButton = () => (
    <Button
      variant="contained"
      startIcon={<ShareIcon />}
      onClick={() => setShareDialogOpen(true)}
      sx={{
        mt: 3,
        mb: 2,
        py: 1.5,
        px: 4,
        fontSize: '1.1rem',
        width: { xs: '100%', sm: 'auto' },
        background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
        boxShadow: '0 3px 5px 2px rgba(255, 152, 0, .3)',
        '&:hover': {
          background: 'linear-gradient(45deg, #ff9800 60%, #ff5722 90%)',
          transform: 'translateY(-2px)',
          transition: 'transform 0.2s'
        }
      }}
    >
      Share My Reading
    </Button>
  );

  const getShareableSummary = () => {
    return shareableSummary || "A balanced individual with natural leadership qualities, combining wisdom with adaptability.";
  };

  const renderShareDialog = () => (
    <Dialog
      open={shareDialogOpen}
      onClose={() => setShareDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Share Your Reading</DialogTitle>
      <DialogContent>
        <Box
          ref={shareCardRef}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(33,33,33,0.95) 0%, rgba(44,44,44,0.95) 100%)',
            border: '1px solid rgba(255,152,0,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #ff9800, #ff5722)',
            }
          }}
        >
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 3,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Typography
              variant="h5"
              sx={{
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: {
                  xs: 'min(1.4rem, 4.5vw)',  // Responsive font size on mobile
                  sm: '1.8rem'
                },
                fontWeight: 600,
                flex: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minWidth: 0
              }}
            >
              <span role="img" aria-label="mahjong" style={{ fontSize: '1.2em', flexShrink: 0 }}>🀄</span>
              My BaziGPT Reading
            </Typography>
            <Box sx={{
              display: { xs: 'none', sm: 'block' },
              width: '80px',
              height: '80px',
              backgroundColor: 'white',
              borderRadius: '8px',
              p: '6px',
              ml: 2
            }}>
              <QRCodeSVG
                value="https://bazigpt.xyz"
                size={68}
                level="L"
                includeMargin={false}
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.3)',
                  mt: 0.5,
                  fontSize: '0.7rem',
                  display: 'block',
                  textAlign: 'center'
                }}
              >
                bazigpt.xyz
              </Typography>
            </Box>
          </Box>

          <Box sx={{ my: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                mb: 2,
                fontSize: { xs: '1.1rem', sm: '1.3rem' }
              }}
            >
              Key Insights:
            </Typography>
            {reading?.reading.split('\n')
              .filter(line => line.includes('**'))
              .slice(0, 4)
              .map((line, index) => {
                const parts = line
                  .replace(/[-•]\s*/, '')
                  .replace(/\*\*/g, '')
                  .split(/(\([^)]+\))/);

                return (
                  <Typography
                    key={index}
                    variant="body1"
                    sx={{
                      mb: 1.5,
                      fontSize: { xs: '0.9rem', sm: '1.1rem' },
                      color: 'text.primary',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'center', sm: 'flex-start' },
                      textAlign: { xs: 'center', sm: 'left' },
                      gap: { xs: 0.5, sm: 1 }
                    }}
                  >
                    {parts.map((part, i) => {
                      if (part.startsWith('(') && part.endsWith(')')) {
                        return (
                          <Typography
                            key={i}
                            component="span"
                            sx={{
                              color: '#ff9800',
                              fontWeight: 500,
                              fontSize: { xs: '0.9rem', sm: '1.1rem' },
                              textAlign: { xs: 'center', sm: 'left' }
                            }}
                          >
                            {part}
                          </Typography>
                        );
                      }
                      return <span key={i} style={{ display: 'block', textAlign: 'inherit' }}>{part}</span>;
                    })}
                  </Typography>
                );
              })}
          </Box>

          <Box sx={{ my: { xs: 2, sm: 3 } }}>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.9rem', sm: '1.1rem' },
                color: 'text.primary',
                fontStyle: 'italic',
                textAlign: 'center',
                mb: 2,
                '& strong': {
                  color: '#ff9800',
                  fontWeight: 600
                }
              }}
            >
              {getShareableSummary()}
            </Typography>
          </Box>

          <Box
            sx={{
              mt: { xs: 2, sm: 4 },
              pt: { xs: 2, sm: 3 },
              borderTop: '1px solid rgba(255,152,0,0.2)',
              display: 'flex',
              flexDirection: { xs: 'row', sm: 'column' },
              alignItems: { xs: 'center', sm: 'stretch' },
              justifyContent: { xs: 'space-between', sm: 'center' },
              gap: { xs: 2, sm: 0 },
              position: 'relative'
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: '0.9rem', sm: '1.2rem' },
                fontWeight: 500,
                textAlign: 'center',
                flex: { xs: 1, sm: 'auto' },
                '& .highlight': {
                  color: '#ff9800',
                  fontWeight: 600,
                  display: { xs: 'block', sm: 'inline' }
                }
              }}
            >
              Get your own reading at <span className="highlight">bazigpt.xyz</span>
            </Typography>
            <Box sx={{
              display: { xs: 'block', sm: 'none' },
              width: '60px',
              height: '60px',
              backgroundColor: 'white',
              borderRadius: '8px',
              p: '4px',
              flexShrink: 0
            }}>
              <QRCodeSVG
                value="https://bazigpt.xyz"
                size={52}
                level="L"
                includeMargin={false}
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.3)',
                  mt: 0.5,
                  fontSize: '0.6rem',
                  display: { xs: 'none', sm: 'block' },
                  textAlign: 'center'
                }}
              >
                bazigpt.xyz
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
        <Button
          onClick={handleShare}
          variant="contained"
          color="primary"
          sx={{
            background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
            px: 3
          }}
        >
          Save Reading
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <title>BaziGPT - AI-Powered Chinese Astrology & BaZi Reading</title>
        <meta name="description" content="Get personalized Chinese Astrology readings and BaZi analysis powered by AI. Discover your destiny, personality traits, and life path based on your birth date and time." />
        <meta name="keywords" content="Chinese astrology, BaZi, Four Pillars, destiny reading, birth chart, Chinese horoscope, AI astrology, free reading, personality analysis, life path" />

        {/* Open Graph */}
        <meta property="og:title" content="BaziGPT - AI-Powered Chinese Astrology & BaZi Reading" />
        <meta property="og:description" content="Get personalized Chinese Astrology readings and BaZi analysis powered by AI. Discover your destiny, personality traits, and life path based on your birth date and time." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bazigpt.com" />
        <meta property="og:image" content="https://bazigpt.com/og-image.svg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BaziGPT - AI-Powered Chinese Astrology & BaZi Reading" />
        <meta name="twitter:description" content="Get personalized Chinese Astrology readings and BaZi analysis powered by AI. Discover your destiny, personality traits, and life path based on your birth date and time." />
        <meta name="twitter:image" content="https://bazigpt.com/og-image.svg" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://bazigpt.com" />
      </Helmet>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Dialog
            open={disclaimerOpen}
            onClose={handleCloseDisclaimer}
            maxWidth="sm"
            fullWidth
            sx={{
              '& .MuiDialog-paper': {
                bgcolor: 'background.paper',
                backgroundImage: 'linear-gradient(rgba(255, 152, 0, 0.05), rgba(255, 152, 0, 0.02))',
              }
            }}
          >
            <DialogTitle sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon /> Privacy & Disclaimer
            </DialogTitle>
            <DialogContent>
              <Typography paragraph sx={{ textAlign: 'justify' }}>
                We respect your privacy. We only ask for the minimum information needed for your reading (birth date and time) and do not store any personal data.
              </Typography>
              <Typography sx={{ textAlign: 'justify' }}>
                Please note: This tool is for entertainment purposes only. The readings should not be taken as factually accurate or followed religiously. Use this as a fun way to explore Chinese Astrology!
              </Typography>
            </DialogContent>
            <DialogActions
              sx={{
                justifyContent: { xs: 'center', sm: 'flex-end' },
                pb: { xs: 3, sm: 4 },
                pr: { xs: 0, sm: 4 },
                pt: 2,
              }}
            >
              <Button
                onClick={handleCloseDisclaimer}
                variant="contained"
                color="primary"
                sx={{
                  minWidth: 160,
                  fontWeight: 500,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  mb: { xs: 1, sm: 0 },
                }}
              >
                I UNDERSTAND
              </Button>
            </DialogActions>
          </Dialog>

          <Zoom in={hasSeenDisclaimer}>
            <Fab
              size="small"
              color="primary"
              aria-label="info"
              onClick={() => setDisclaimerOpen(true)}
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                bgcolor: 'background.paper',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(255, 152, 0, 0.1)',
                }
              }}
            >
              <InfoIcon />
            </Fab>
          </Zoom>

          <Box sx={{ my: 2 }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              align="center"
              sx={{
                mb: 2,
                fontSize: {
                  xs: '2.5rem',
                  sm: '3.5rem',
                  md: '3.75rem'
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
                mb: 3,
                fontSize: {
                  xs: '1.2rem',
                  sm: '1.5rem'
                }
              }}
            >
              Discover your Chinese Fortune Reading (Powered by AI!)
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: isBaziInfoExpanded ? { xs: 2, sm: 3 } : { xs: 1.5, sm: 2 },
                mb: 3,
                bgcolor: 'rgba(255, 152, 0, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(255, 152, 0, 0.2)',
                transition: 'padding 0.3s ease'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: isBaziInfoExpanded ? 2 : 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: { xs: '1rem', sm: '1.1rem' }
                  }}
                >
                  What is Bazi?
                </Typography>
                <IconButton
                  onClick={() => setIsBaziInfoExpanded(!isBaziInfoExpanded)}
                  sx={{
                    transform: isBaziInfoExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                    color: 'primary.main',
                    padding: '8px',
                    '&:hover': {
                      bgcolor: 'rgba(255, 152, 0, 0.1)',
                    }
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Box>

              <Collapse in={isBaziInfoExpanded} timeout={300}>
                <Typography
                  variant="body1"
                  align="center"
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    color: 'text.primary',
                    lineHeight: 1.6,
                    '& strong': {
                      color: 'primary.main',
                      fontWeight: 600
                    }
                  }}
                >
                  Also known as the "Four Pillars of Destiny," Bazi is an ancient Chinese astrology system that analyzes your birth date and time to reveal insights about your personality, relationships, career path, and life's opportunities. Each reading provides personalized guidance based on the cosmic energies present at your birth moment.
                  <br /><br />
                  <strong>New Feature:</strong> Try our <strong>Relationship Compatibility</strong> tool to discover how two people's Bazi charts interact and what this reveals about their relationship dynamics, communication styles, and potential for harmony.
                </Typography>
              </Collapse>
            </Paper>

            {/* Reading Mode Toggle */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <ToggleButtonGroup
                value={readingMode}
                exclusive
                onChange={(_, newMode) => {
                  if (newMode !== null) {
                    setReadingMode(newMode);
                    // Clear any existing readings when switching modes
                    setReading(null);
                    setCompatibilityReading(null);
                    setError(null);
                    setCompatibilityError(null);
                  }
                }}
                aria-label="reading mode"
                sx={{
                  width: '100%',
                  maxWidth: { xs: '100%', sm: '600px' },
                  '& .MuiToggleButton-root': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    flex: 1,
                    minWidth: 0,
                    whiteSpace: { xs: 'normal', sm: 'nowrap' },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 2, sm: 1.5 },
                    px: { xs: 1, sm: 2 },
                    minHeight: { xs: '60px', sm: 'auto' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      }
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    }
                  }
                }}
              >
                <ToggleButton value="solo" aria-label="solo reading">
                  🀄 Solo Reading
                </ToggleButton>
                <ToggleButton value="compatibility" aria-label="compatibility reading">
                  💕 Relationship Compatibility
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>



            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
              {readingMode === 'solo' ? (
                // Solo Reading Form
                !reading ? (
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
                )
              ) : (
                // Compatibility Reading Form
                !compatibilityReading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      Enter birth information for you and your partner
                    </Typography>

                    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, width: '100%' }}>
                      {/* You */}
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ color: '#ff9800' }}>
                          You
                        </Typography>
                        <DatePicker
                          label="Birth Date"
                          value={person1BirthDate}
                          onChange={handlePerson1DateChange}
                          format="dd-MM-yyyy"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              placeholder: "DD-MM-YYYY",
                            }
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Birth Time (Optional)"
                          type="time"
                          value={person1BirthTime}
                          onChange={handlePerson1TimeChange}
                          margin="normal"
                          InputLabelProps={{ shrink: true }}
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
                      </Box>

                      {/* Your Partner */}
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ color: '#ff9800' }}>
                          Your Partner
                        </Typography>
                        <DatePicker
                          label="Birth Date"
                          value={person2BirthDate}
                          onChange={handlePerson2DateChange}
                          format="dd-MM-yyyy"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              placeholder: "DD-MM-YYYY",
                            }
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Birth Time (Optional)"
                          type="time"
                          value={person2BirthTime}
                          onChange={handlePerson2TimeChange}
                          margin="normal"
                          InputLabelProps={{ shrink: true }}
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
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      onClick={handleCompatibilitySubmit}
                      disabled={!person1BirthDate || !person2BirthDate || compatibilityLoading}
                      sx={{
                        mt: 2,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      {compatibilityLoading ? 'Generating Compatibility...' : 'Get Compatibility Reading'}
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Compatibility Details
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                      You: {person1BirthDate && formatDate(person1BirthDate)}
                      {person1BirthTime && ` at ${person1BirthTime}`}
                      <br />
                      Your Partner: {person2BirthDate && formatDate(person2BirthDate)}
                      {person2BirthTime && ` at ${person2BirthTime}`}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={handleCompatibilityRestart}
                      startIcon={<RefreshIcon />}
                      sx={{
                        mt: 1,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Start New Compatibility Reading
                    </Button>
                  </Box>
                )
              )}
            </Paper>

            {/* Loading and Error States */}
            {(loading || compatibilityLoading) && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {(error || compatibilityError) && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error || compatibilityError}
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
                      '& > :first-of-type': {
                        mt: 0
                      },
                      '& > :last-of-type': {
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
                      {reading.reading.split('\n').map((line, index, lines) => {
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

            {reading && !loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {renderShareButton()}
              </Box>
            )}

            {/* Compatibility Results */}
            {compatibilityReading && !compatibilityLoading && (
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
                  <span role="img" aria-label="heart">💕</span>
                  Compatibility Analysis
                </Typography>

                <Box sx={{
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
                    '& > :first-of-type': {
                      mt: 0
                    },
                    '& > :last-of-type': {
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
                      mb: 1,
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
                      lineHeight: 1.4,
                      mb: 1
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
                    mb: 0.25,
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
                    mb: 0.5,
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
                    {compatibilityReading.reading.split('\n').map((line, index, lines) => {
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
                                      <Typography key={contentIndex} component="li" sx={{ mb: 0.5, display: 'flex', alignItems: 'flex-start' }}>
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
                                  return <Typography key={contentIndex} component="li" sx={{ mb: 0.5 }}>{bulletContent}</Typography>;
                                }
                                if (contentLine.includes('**')) {
                                  const parts = contentLine.split('**');
                                  return (
                                    <Typography key={contentIndex} sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
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
                                  return <Box key={contentIndex} sx={{ mb: 0.5 }} />;
                                }
                                return <Typography key={contentIndex} sx={{ mb: 0.5, textAlign: 'justify' }}>{contentLine}</Typography>;
                              })}
                            </Box>
                          </Box>
                        );
                      }
                      return null;
                    })}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={handleCompatibilityRestart}
                    sx={{ mr: 2 }}
                  >
                    Start New Analysis
                  </Button>
                </Box>
              </Paper>
            )}

            {compatibilityReading && !compatibilityLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<ShareIcon />}
                  onClick={() => setCompatibilityShareDialogOpen(true)}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    width: { xs: '100%', sm: 'auto' },
                    background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
                    boxShadow: '0 3px 5px 2px rgba(255, 152, 0, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #ff9800 60%, #ff5722 90%)',
                      transform: 'translateY(-2px)',
                      transition: 'transform 0.2s'
                    }
                  }}
                >
                  Share Our Reading
                </Button>
              </Box>
            )}

            {/* Compatibility Share Dialog */}
            {compatibilityReading && (
              <Dialog open={compatibilityShareDialogOpen} onClose={() => setCompatibilityShareDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Share Our Compatibility Reading</DialogTitle>
                <DialogContent>
                  <Box
                    ref={compatibilityShareCardRef}
                    sx={{
                      p: { xs: 2, sm: 4 },
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(33,33,33,0.95) 0%, rgba(44,44,44,0.95) 100%)',
                      border: '1px solid rgba(255,152,0,0.3)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #ff9800, #ff5722)',
                      }
                    }}
                  >
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 3,
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <Typography
                        variant="h5"
                        sx={{
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontSize: {
                            xs: 'min(1.2rem, 4vw)',
                            sm: '1.6rem'
                          },
                          fontWeight: 600,
                          flex: 1,
                          whiteSpace: 'normal',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minWidth: 0,
                          wordWrap: 'break-word',
                          lineHeight: 1.2
                        }}
                      >
                        <span role="img" aria-label="heart" style={{ fontSize: '1.2em', flexShrink: 0 }}>💕</span>
                        Our Compatibility Reading
                      </Typography>
                      <Box sx={{
                        display: { xs: 'none', sm: 'block' },
                        width: '80px',
                        height: '80px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        p: '6px',
                        ml: 2
                      }}>
                        <QRCodeSVG
                          value="https://bazigpt.xyz"
                          size={68}
                          level="L"
                          includeMargin={false}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.3)',
                            mt: 0.5,
                            fontSize: '0.7rem',
                            display: 'block',
                            textAlign: 'center'
                          }}
                        >
                          bazigpt.xyz
                        </Typography>
                      </Box>
                    </Box>

                    {/* Personalized Birth Info */}
                    <Box sx={{
                      mb: 3,
                      p: 2,
                      backgroundColor: 'rgba(255,152,0,0.1)',
                      borderRadius: 2,
                      border: '1px solid rgba(255,152,0,0.2)'
                    }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'primary.main',
                          fontWeight: 600,
                          mb: 1.5,
                          fontSize: { xs: '1rem', sm: '1.2rem' },
                          textAlign: 'center'
                        }}
                      >
                        Our Birth Charts
                      </Typography>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 2 },
                        justifyContent: 'center'
                      }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.primary',
                            fontSize: { xs: '0.85rem', sm: '0.95rem' },
                            textAlign: { xs: 'center', sm: 'left' }
                          }}
                        >
                          <strong style={{ color: '#ff9800' }}>You:</strong> {formatDate(person1BirthDate)}
                          {person1BirthTime && ` at ${person1BirthTime}`}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.primary',
                            fontSize: { xs: '0.85rem', sm: '0.95rem' },
                            textAlign: { xs: 'center', sm: 'left' }
                          }}
                        >
                          <strong style={{ color: '#ff9800' }}>Your Partner:</strong> {formatDate(person2BirthDate)}
                          {person2BirthTime && ` at ${person2BirthTime}`}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ my: { xs: 2, sm: 3 } }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'primary.main',
                          fontWeight: 600,
                          mb: 2,
                          fontSize: { xs: '1.1rem', sm: '1.3rem' }
                        }}
                      >
                        Key Insights About Us:
                      </Typography>
                      {compatibilityReading?.reading.split('\n')
                        .filter(line => {
                          // Look for meaningful insights, not just technical jargon
                          const hasBullet = line.includes('•') || line.includes('-');
                          const hasRelationshipTerms = line.includes('communication') || line.includes('relationship') ||
                            line.includes('partner') || line.includes('you') ||
                            line.includes('together') || line.includes('support') ||
                            line.includes('strength') || line.includes('challenge');
                          const hasPracticalAdvice = line.includes('advice') || line.includes('suggestion') ||
                            line.includes('recommend') || line.includes('try') ||
                            line.includes('practice') || line.includes('focus');

                          return hasBullet && (hasRelationshipTerms || hasPracticalAdvice);
                        })
                        .slice(0, 3)
                        .map((line, index) => {
                          // Clean up the line and make it more shareable
                          const cleanLine = line
                            .replace(/^[-•]\s*/, '') // Remove bullet points
                            .replace(/\*\*/g, '') // Remove markdown bold
                            .replace(/^###\s*/, '') // Remove headers
                            .trim();

                          // Skip empty lines or very short lines
                          if (cleanLine.length < 15) return null;

                          return (
                            <Typography
                              key={index}
                              variant="body1"
                              sx={{
                                mb: 1.5,
                                fontSize: { xs: '0.9rem', sm: '1.1rem' },
                                color: 'text.primary',
                                textAlign: 'center',
                                fontStyle: 'italic',
                                lineHeight: 1.4
                              }}
                            >
                              {cleanLine}
                            </Typography>
                          );
                        })}
                    </Box>

                    <Box sx={{ my: { xs: 2, sm: 3 } }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: { xs: '0.9rem', sm: '1.1rem' },
                          color: 'text.primary',
                          fontStyle: 'italic',
                          textAlign: 'center',
                          mb: 2,
                          '& strong': {
                            color: '#ff9800',
                            fontWeight: 600
                          }
                        }}
                      >
                        {getCompatibilityShareableSummary()}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        mt: { xs: 2, sm: 4 },
                        pt: { xs: 2, sm: 3 },
                        borderTop: '1px solid rgba(255,152,0,0.2)',
                        display: 'flex',
                        flexDirection: { xs: 'row', sm: 'column' },
                        alignItems: { xs: 'center', sm: 'stretch' },
                        justifyContent: { xs: 'space-between', sm: 'center' },
                        gap: { xs: 2, sm: 0 },
                        position: 'relative'
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: '0.9rem', sm: '1.2rem' },
                          fontWeight: 500,
                          textAlign: 'center',
                          flex: { xs: 1, sm: 'auto' },
                          '& .highlight': {
                            color: '#ff9800',
                            fontWeight: 600,
                            display: { xs: 'block', sm: 'inline' }
                          }
                        }}
                      >
                        Get your compatibility reading at <span className="highlight">bazigpt.xyz</span>
                      </Typography>
                      <Box sx={{
                        display: { xs: 'block', sm: 'none' },
                        width: '60px',
                        height: '60px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        p: '4px',
                        flexShrink: 0
                      }}>
                        <QRCodeSVG
                          value="https://bazigpt.xyz"
                          size={52}
                          level="L"
                          includeMargin={false}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.3)',
                            mt: 0.5,
                            fontSize: '0.6rem',
                            display: { xs: 'none', sm: 'block' },
                            textAlign: 'center'
                          }}
                        >
                          bazigpt.xyz
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setCompatibilityShareDialogOpen(false)}>Cancel</Button>
                  <Button
                    onClick={handleCompatibilityShareDownload}
                    variant="contained"
                    color="primary"
                    sx={{
                      background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
                      px: 3
                    }}
                  >
                    Save Reading
                  </Button>
                </DialogActions>
              </Dialog>
            )}
          </Box>

          {/* Only render share dialog when we have a reading */}
          {reading && renderShareDialog()}

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
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button
                    component="a"
                    href="/privacy"
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      '&:hover': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    Privacy Policy
                  </Button>
                  <Button
                    component="a"
                    href="/terms"
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      '&:hover': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    Terms of Service
                  </Button>
                </Box>
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
                  href="https://t.me/ZeroXBarnum"
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
        <SEOAnalytics
          pageTitle="BaziGPT - AI-Powered Chinese Astrology & BaZi Reading"
          pageDescription="Get personalized Chinese Astrology readings and BaZi analysis powered by AI. Discover your destiny, personality traits, and life path based on your birth date and time."
          keywords={["Chinese astrology", "BaZi", "Four Pillars", "destiny reading", "birth chart", "Chinese horoscope", "AI astrology", "free reading", "personality analysis", "life path"]}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </Router>
  );
}

export default App;
