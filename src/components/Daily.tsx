import { useState, useEffect, useRef } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { format } from 'date-fns';
import ShareIcon from '@mui/icons-material/Share';
import { fetchDailyForecast, type DailyBaziForecast } from '../services/dailyBaziApi';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

function Daily() {
    const [loading, setLoading] = useState(true);
    const [forecast, setForecast] = useState<DailyBaziForecast | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const shareCardRef = useRef<HTMLDivElement>(null);

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
        setShareDialogOpen(true);
    };

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

            {/* Share Dialog */}
            {forecast && (
                <Dialog
                    open={shareDialogOpen}
                    onClose={() => setShareDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Share Daily Forecast</DialogTitle>
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
                                            xs: 'min(1.4rem, 4.5vw)',
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
                                    Daily Bazi Forecast
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
                                    {formattedDate}
                                </Typography>
                                <Chip
                                    label={forecast.baziPillar}
                                    color="primary"
                                    variant="outlined"
                                    sx={{
                                        borderColor: 'primary.main',
                                        color: 'primary.main',
                                        mb: 2
                                    }}
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
                                    {forecast.forecast}
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
                                    Get your personalized reading at <span className="highlight">bazigpt.xyz</span>
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
                            onClick={handleShareDownload}
                            variant="contained"
                            color="primary"
                            sx={{
                                background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
                                px: 3
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