import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
// Navigation now handled by Layout component
import {
    Container,
    Box,
    Typography,
    Paper,
    CircularProgress,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Collapse,
    Alert,
} from '@mui/material';
import { format } from 'date-fns';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { fetchDailyForecast, fetchPersonalForecast, type DailyBaziForecast, type PersonalForecastResponse } from '../services/dailyBaziApi';
import html2canvas from 'html2canvas';
import SEOAnalytics from './SEOAnalytics';
import ReactMarkdown from 'react-markdown';
import ShareCardBase from './ShareCardBase';

function formatPersonalForecast(text: string) {
    // Ensure each bullet starts on a new line
    return text.replace(/\s*•\s*/g, '\n• ');
}

function Daily() {
    const [loading, setLoading] = useState(true);
    const [forecast, setForecast] = useState<DailyBaziForecast | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const shareCardRef = useRef<HTMLDivElement>(null);

    // Personal forecast state with persistence
    const [showPersonalForecast, setShowPersonalForecast] = useState(false);
    // Initialize as empty string
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    // Session storage key for personal forecast
    const PERSONAL_FORECAST_KEY = 'bazi-personal-forecast-session';
    const [personalForecast, setPersonalForecast] = useState<PersonalForecastResponse | null>(() => {
        // Prefer sessionStorage, then localStorage
        const today = new Date().toISOString().split('T')[0];
        const sessionSaved = sessionStorage.getItem(PERSONAL_FORECAST_KEY);
        if (sessionSaved) {
            try {
                const parsed = JSON.parse(sessionSaved);
                if (parsed.date === today) return parsed;
            } catch { }
        }
        const localSaved = localStorage.getItem('bazi-personal-forecast');
        if (localSaved) {
            try {
                const parsed = JSON.parse(localSaved);
                if (parsed.date === today) return parsed;
            } catch { }
        }
        return null;
    });
    const [personalLoading, setPersonalLoading] = useState(false);
    const [personalError, setPersonalError] = useState<string | null>(null);

    const today = new Date();
    const formattedDate = format(today, 'MMMM d, yyyy');

    const fetchDailyForecastData = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchDailyForecast();
            setForecast(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching the daily forecast.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDailyForecastData();
    }, []);

    // Save birth details to localStorage when they change
    useEffect(() => {
        if (birthDate) {
            localStorage.setItem('bazi-birth-date', birthDate);
        }
    }, [birthDate]);

    useEffect(() => {
        if (birthTime) {
            localStorage.setItem('bazi-birth-time', birthTime);
        } else {
            localStorage.removeItem('bazi-birth-time');
        }
    }, [birthTime]);

    // Save personal forecast to sessionStorage and localStorage when it changes
    useEffect(() => {
        if (personalForecast) {
            const forecastWithDate = {
                ...personalForecast,
                date: new Date().toISOString().split('T')[0]
            };
            sessionStorage.setItem(PERSONAL_FORECAST_KEY, JSON.stringify(forecastWithDate));
            localStorage.setItem('bazi-personal-forecast', JSON.stringify(forecastWithDate));
        } else {
            sessionStorage.removeItem(PERSONAL_FORECAST_KEY);
        }
    }, [personalForecast]);

    // Auto-show personal forecast section if we have saved data from today
    useEffect(() => {
        if (personalForecast && birthDate) {
            setShowPersonalForecast(true);
        }
    }, [personalForecast, birthDate]);

    useEffect(() => {
        // On mount, prefer solo sessionStorage, then localStorage
        let filled = false;
        const soloBirth = sessionStorage.getItem('bazi-solo-birth');
        if (soloBirth) {
            const { birthDate: soloDate, birthTime: soloTime } = JSON.parse(soloBirth);
            if (soloDate) {
                setBirthDate(soloDate.split('T')[0]);
                filled = true;
            }
            if (soloTime) setBirthTime(soloTime);
        }
        if (!filled) {
            const localDate = localStorage.getItem('bazi-birth-date');
            if (localDate) setBirthDate(localDate);
            const localTime = localStorage.getItem('bazi-birth-time');
            if (localTime) setBirthTime(localTime);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleShareDownload = async () => {
        if (!shareCardRef.current) return;

        try {
            const canvas = await html2canvas(shareCardRef.current, {
                backgroundColor: '#1a1a1a',
                scale: 2,
                useCORS: true,
            });

            const link = document.createElement('a');
            link.download = `daily-bazi-forecast-${formattedDate}.png`;
            link.href = canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error('Error generating share image:', error);
        }
    };

    const handlePersonalForecastToggle = () => {
        setShowPersonalForecast(!showPersonalForecast);
        // Don't clear the forecast when collapsing - just toggle visibility
    };

    const handlePersonalForecastSubmit = async () => {
        if (!birthDate) {
            setPersonalError('Please enter your birth date');
            return;
        }

        setPersonalLoading(true);
        setPersonalError(null);

        try {
            const data = await fetchPersonalForecast(birthDate, birthTime || undefined);
            setPersonalForecast(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching your personal forecast.';
            setPersonalError(errorMessage);
        } finally {
            setPersonalLoading(false);
        }
    };



    return (
        <>
            <Helmet>
                <title>Daily Bazi Forecast - {formattedDate} | BaziGPT</title>
                <meta
                    name="description"
                    content="Get your daily Bazi forecast for today. Discover the energy of the day and practical guidance based on Chinese Four Pillars astrology."
                />
                <meta name="keywords" content="daily bazi forecast, Chinese astrology, Four Pillars, daily horoscope, bazi reading, Chinese zodiac, daily energy, bazi analysis" />

                {/* Open Graph */}
                <meta property="og:title" content={`Daily Bazi Forecast - ${formattedDate} | BaziGPT`} />
                <meta property="og:description" content="Get your daily Bazi forecast for today. Discover the energy of the day and practical guidance based on Chinese Four Pillars astrology." />
                <meta property="og:url" content="https://bazigpt.xyz/daily" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://bazigpt.xyz/og-image.svg" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:title" content={`Daily Bazi Forecast - ${formattedDate} | BaziGPT`} />
                <meta property="twitter:description" content="Get your daily Bazi forecast for today. Discover the energy of the day and practical guidance based on Chinese Four Pillars astrology." />
                <meta property="twitter:image" content="https://bazigpt.xyz/og-image.svg" />

                {/* Canonical */}
                <link rel="canonical" href="https://bazigpt.xyz/daily" />

                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": "Daily Bazi Forecast",
                        "description": "Get your daily Bazi forecast for today. Discover the energy of the day and practical guidance based on Chinese Four Pillars astrology.",
                        "url": "https://bazigpt.xyz/daily",
                        "datePublished": formattedDate,
                        "dateModified": formattedDate,
                        "publisher": {
                            "@type": "Organization",
                            "name": "BaziGPT"
                        }
                    })}
                </script>
            </Helmet>

            <SEOAnalytics
                pageTitle={`Daily Bazi Forecast - ${formattedDate} | BaziGPT`}
                pageDescription="Get your daily Bazi forecast for today. Discover the energy of the day and practical guidance based on Chinese Four Pillars astrology."
                keywords={[
                    "daily bazi forecast", "Chinese astrology", "Four Pillars", "daily horoscope",
                    "bazi reading", "Chinese zodiac", "daily energy", "bazi analysis"
                ]}
            />

            <Container maxWidth="md" sx={{ py: 4 }}>
                <Box sx={{ my: 2 }}>
                    <Typography
                        variant="h2"
                        component="h1"
                        gutterBottom
                        align="center"
                        sx={{
                            mb: 3,
                            fontSize: {
                                xs: '2rem',
                                sm: '2.5rem',
                                md: '3rem'
                            },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: { xs: '0.5rem', sm: '1rem' }
                        }}
                    >
                        <span style={{ fontSize: '0.9em' }}>🀄</span>
                        Daily Bazi Forecast
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
                            },
                            color: 'text.secondary'
                        }}
                    >
                        {formattedDate}
                    </Typography>
                    {/* Navigation removed - now handled by Layout component */}
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        mb: 3,
                        bgcolor: 'rgba(255, 152, 0, 0.1)',
                        borderRadius: 2,
                        border: '1px solid rgba(255, 152, 0, 0.2)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                            <CircularProgress size={60} color="primary" />
                        </Box>
                    ) : error ? (
                        <Box>
                            <Typography variant="h6" color="error" gutterBottom>
                                Error Loading Forecast
                            </Typography>
                            <Typography variant="body1" color="error">
                                {error}
                            </Typography>
                        </Box>
                    ) : forecast ? (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: 'primary.main',
                                            fontWeight: 600,
                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                            mb: 2
                                        }}
                                    >
                                        Today's Energy
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Chip
                                            label={forecast.baziPillar}
                                            color="primary"
                                            variant="outlined"
                                            sx={{
                                                borderColor: 'primary.main',
                                                color: 'primary.main',
                                                '&:hover': {
                                                    bgcolor: 'rgba(255, 152, 0, 0.1)',
                                                }
                                            }}
                                        />

                                    </Box>
                                </Box>
                                {/* Remove the IconButton for the standard daily forecast share (do not render it) */}
                            </Box>

                            <Typography
                                variant="body1"
                                align="left"
                                sx={{ display: 'none' }}
                            >
                                {/* Old plain rendering hidden for now */}
                            </Typography>
                            {forecast && (
                                <Box sx={{
                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                    color: 'text.primary',
                                    lineHeight: 1.6,
                                    mb: 3,
                                    '& .highlight': {
                                        color: 'primary.main',
                                        fontWeight: 600
                                    }
                                }}>
                                    <ReactMarkdown>{forecast.forecast}</ReactMarkdown>
                                </Box>
                            )}

                            {/* Personal Forecast Section */}
                            <Box sx={{
                                mt: { xs: 2, sm: 4 },
                                pt: { xs: 2, sm: 3 },
                                borderTop: '1px solid rgba(255,152,0,0.2)',
                            }}>
                                <Button
                                    onClick={handlePersonalForecastToggle}
                                    variant="outlined"
                                    color="primary"
                                    fullWidth
                                    sx={{
                                        mb: 2,
                                        borderRadius: 2,
                                        py: 1.5,
                                        borderColor: 'primary.main',
                                        color: 'primary.main',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 152, 0, 0.1)',
                                            borderColor: 'primary.main',
                                        }
                                    }}
                                    endIcon={showPersonalForecast ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                >
                                    How does today affect me?
                                </Button>

                                <Collapse in={showPersonalForecast}>
                                    <Box sx={{ mt: 2 }}>
                                        {!personalForecast ? (
                                            <>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    Enter your birth details to get a personalized daily forecast based on your Bazi chart.
                                                    {birthDate && (
                                                        <span style={{ color: '#ff9800', fontWeight: 500 }}>
                                                            {' '}Your details are saved for this session.
                                                        </span>
                                                    )}
                                                </Typography>

                                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
                                                    <TextField
                                                        label="Birth Date"
                                                        type="date"
                                                        value={birthDate}
                                                        onChange={(e) => setBirthDate(e.target.value)}
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                '&:hover fieldset': {
                                                                    borderColor: 'primary.main',
                                                                },
                                                            },
                                                        }}
                                                    />
                                                    <TextField
                                                        label="Birth Time (optional)"
                                                        type="time"
                                                        value={birthTime}
                                                        onChange={(e) => setBirthTime(e.target.value)}
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                '&:hover fieldset': {
                                                                    borderColor: 'primary.main',
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </Box>

                                                {personalError && (
                                                    <Alert severity="error" sx={{ mb: 2 }}>
                                                        {personalError}
                                                    </Alert>
                                                )}

                                                <Button
                                                    onClick={handlePersonalForecastSubmit}
                                                    variant="contained"
                                                    color="primary"
                                                    disabled={personalLoading}
                                                    fullWidth
                                                    sx={{
                                                        borderRadius: 2,
                                                        py: 1.5,
                                                        background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(45deg, #ff5722 30%, #ff9800 90%)',
                                                        },
                                                        '&:disabled': {
                                                            background: 'rgba(255, 152, 0, 0.3)',
                                                        }
                                                    }}
                                                >
                                                    {personalLoading ? (
                                                        <CircularProgress size={20} color="inherit" />
                                                    ) : (
                                                        'Get Personal Daily Forecast'
                                                    )}
                                                </Button>
                                            </>
                                        ) : (
                                            <Box sx={{ p: 3, bgcolor: 'rgba(255, 152, 0, 0.05)', borderRadius: 2, border: '1px solid rgba(255, 152, 0, 0.2)' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                                    <Box>
                                                        <Typography variant="h6" color="primary.main" gutterBottom>
                                                            Your Personal Forecast
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Birth: {new Date(birthDate).toLocaleDateString()}
                                                            {birthTime && ` at ${birthTime}`}
                                                        </Typography>
                                                    </Box>
                                                    <Button
                                                        onClick={() => {
                                                            setPersonalForecast(null);
                                                            setPersonalError(null);
                                                        }}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            borderColor: 'text.secondary',
                                                            color: 'text.secondary',
                                                            '&:hover': {
                                                                borderColor: 'primary.main',
                                                                color: 'primary.main',
                                                            }
                                                        }}
                                                    >
                                                        New Reading
                                                    </Button>
                                                </Box>
                                                <Chip
                                                    label={personalForecast.todayPillar}
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ mb: 2, borderColor: 'primary.main', color: 'primary.main' }}
                                                />
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontSize: { xs: '0.9rem', sm: '1rem' },
                                                        color: 'text.primary',
                                                        lineHeight: 1.6,
                                                        whiteSpace: 'pre-line',
                                                        '& .highlight': {
                                                            color: 'primary.main',
                                                            fontWeight: 600
                                                        }
                                                    }}
                                                >
                                                    {personalForecast.personalForecast}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Collapse>
                            </Box>

                            {personalForecast && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<ShareIcon />}
                                        onClick={() => setShareDialogOpen(true)}
                                        sx={{
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
                                        Share My Personal Forecast
                                    </Button>
                                </Box>
                            )}

                            <Box sx={{
                                mt: { xs: 2, sm: 4 },
                                pt: { xs: 2, sm: 3 },
                                borderTop: '1px solid rgba(255,152,0,0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                textAlign: 'center'
                            }}>
                                <Typography
                                    sx={{
                                        fontSize: { xs: '0.9rem', sm: '1.2rem' },
                                        fontWeight: 500,
                                        color: 'text.secondary',
                                        '& .highlight': {
                                            color: '#ff9800',
                                            fontWeight: 600,
                                            display: 'inline'
                                        }
                                    }}
                                >
                                    Want a complete Bazi analysis?
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 1, fontSize: '0.9rem' }}
                                >
                                    Get your full birth chart reading with detailed insights
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    href="/"
                                    sx={{
                                        minWidth: 200,
                                        fontWeight: 400,
                                        fontSize: '1.1rem',
                                        borderRadius: 2,
                                        px: 3,
                                        py: 1.5,
                                        background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #ff5722 30%, #ff9800 90%)',
                                        }
                                    }}
                                >
                                    Get Full Bazi Reading
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Box>
                            <Typography variant="h6" color="primary.main" gutterBottom>
                                Daily Forecast Coming Soon
                            </Typography>
                            <Typography variant="body1">
                                The daily forecast feature is being set up. Please check back soon!
                            </Typography>
                        </Box>
                    )}
                </Paper>


            </Container>

            {/* Share Dialog */}
            {shareDialogOpen && personalForecast && (
                <Dialog
                    open={shareDialogOpen}
                    onClose={() => setShareDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            bgcolor: '#1e1e1e',
                            color: 'white',
                            borderRadius: 3,
                        }
                    }}
                >
                    <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                        Share Your Personal Daily Forecast
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <ShareCardBase
                                title="My Personal Daily Forecast"
                                qrValue={window.location.href}
                            >
                                <Typography variant="h6" sx={{ color: '#ff9800', mb: 2, fontWeight: 'bold' }}>
                                    {formattedDate}
                                </Typography>
                                {personalForecast.todayPillar && (
                                    <Chip
                                        label={personalForecast.todayPillar}
                                        color="primary"
                                        variant="outlined"
                                        sx={{
                                            borderColor: 'primary.main',
                                            color: 'primary.main',
                                            mb: 2
                                        }}
                                    />
                                )}
                                <Typography variant="body1" sx={{ color: 'white', mb: 2, lineHeight: 1.6, textAlign: 'center' }}>
                                    <ReactMarkdown>{formatPersonalForecast(personalForecast.personalForecast)}</ReactMarkdown>
                                </Typography>
                            </ShareCardBase>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                        <Button
                            onClick={() => setShareDialogOpen(false)}
                            variant="outlined"
                            sx={{
                                borderColor: 'rgba(255, 152, 0, 0.3)',
                                color: '#ff9800',
                                '&:hover': {
                                    borderColor: '#ff9800',
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleShareDownload}
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
                                color: 'white',
                                px: 4,
                                py: 1.5,
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #ff9800 60%, #ff5722 90%)',
                                }
                            }}
                        >
                            Save Forecast
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
}

export default Daily; 