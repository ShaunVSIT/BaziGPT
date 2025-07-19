import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Container,
    Box,
    Typography,
    Paper,
    CircularProgress,
    Button,
    IconButton,
    Chip,
} from '@mui/material';
import { format } from 'date-fns';
import ShareIcon from '@mui/icons-material/Share';
import { fetchDailyForecast, type DailyBaziForecast } from '../services/dailyBaziApi';

function Daily() {
    const [loading, setLoading] = useState(true);
    const [forecast, setForecast] = useState<DailyBaziForecast | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    const handleShare = () => {
        // For now, just copy the URL to clipboard
        navigator.clipboard.writeText(window.location.href);
        // You can add a toast notification here later
    };

    return (
        <>
            <Helmet>
                <title>Daily Bazi Forecast - {formattedDate} | BaziGPT</title>
                <meta
                    name="description"
                    content="Get your daily Bazi forecast for today. Discover the energy of the day and practical guidance based on Chinese Four Pillars astrology."
                />
            </Helmet>

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
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Button
                            component="a"
                            href="/"
                            variant="contained"
                            color="primary"
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 500,
                                textTransform: 'none',
                                background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #ff5722 30%, #ff9800 90%)',
                                }
                            }}
                        >
                            🀄 Personal Reading
                        </Button>
                    </Box>
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
                                        {forecast.cached && (
                                            <Chip
                                                label="Cached"
                                                size="small"
                                                color="secondary"
                                                variant="outlined"
                                                sx={{
                                                    borderColor: 'secondary.main',
                                                    color: 'secondary.main'
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                                <Box>
                                    <IconButton
                                        onClick={handleShare}
                                        color="primary"
                                        sx={{
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 152, 0, 0.1)',
                                            }
                                        }}
                                        aria-label="Share forecast"
                                    >
                                        <ShareIcon />
                                    </IconButton>
                                </Box>
                            </Box>

                            <Typography
                                variant="body1"
                                align="left"
                                sx={{
                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                    color: 'text.primary',
                                    lineHeight: 1.6,
                                    whiteSpace: 'pre-line',
                                    mb: 3,
                                    '& .highlight': {
                                        color: 'primary.main',
                                        fontWeight: 600
                                    }
                                }}
                            >
                                {forecast.forecast}
                            </Typography>

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
                                    Want a personalized reading?
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
                                    Get Your Personal Bazi Reading
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
                                About Daily Forecasts
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Daily forecasts are generated using AI and traditional Bazi astrology principles. Each day brings unique cosmic energies that influence our daily experiences and opportunities.
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Built with React, Material-UI, and GPT-4
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </>
    );
}

export default Daily; 