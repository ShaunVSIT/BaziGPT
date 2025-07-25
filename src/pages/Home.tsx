import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { track } from '@vercel/analytics/react';
import SoloReading from '../components/SoloReading';
import CompatibilityReading from '../components/CompatibilityReading';

const Home: React.FC = () => {
    const [readingMode, setReadingMode] = useState<'solo' | 'compatibility'>('solo');
    const [disclaimerOpen, setDisclaimerOpen] = useState(() => {
        const hasSeen = localStorage.getItem('bazigpt_disclaimer_seen');
        return !hasSeen;
    });

    // Switch to compatibility mode if ?mode=compatibility is present
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'compatibility') {
            setReadingMode('compatibility');
        }
    }, []);

    const handleModeSwitch = (newMode: 'solo' | 'compatibility') => {
        setReadingMode(newMode);
    };

    const handleCloseDisclaimer = () => {
        track('disclaimer_accepted');
        setDisclaimerOpen(false);
        localStorage.setItem('bazigpt_disclaimer_seen', 'true');
    };

    return (
        <>
            <Helmet>
                <title>BaziGPT - AI-Powered Bazi Readings</title>
                <meta name="description" content="Get personalized Bazi readings and compatibility analysis powered by AI. Discover deep insights about your personality, relationships, and life path with BaziGPT." />
                <meta name="keywords" content="Chinese astrology, BaZi reading, free astrology, AI astrology, personality analysis, relationship compatibility, daily horoscope, Chinese zodiac, birth chart analysis" />
                <meta name="author" content="BaziGPT" />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content="BaziGPT - AI-Powered Bazi Readings" />
                <meta property="og:description" content="Get personalized Bazi readings and compatibility analysis powered by AI." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://bazigpt.com" />
                <meta property="og:image" content="https://bazigpt.com/og-image.svg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="BaziGPT - AI-Powered Bazi Readings" />
                <meta name="twitter:description" content="Get personalized Bazi readings and compatibility analysis powered by AI." />
                <meta name="twitter:image" content="https://bazigpt.com/og-image.svg" />

                {/* Additional SEO for Google Ads */}
                <meta name="google-site-verification" content="your-verification-code" />
                <meta name="msvalidate.01" content="your-bing-verification-code" />
                <link rel="canonical" href="https://bazigpt.com" />

                {/* Structured Data for Better Search Visibility */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "BaziGPT",
                        "description": "AI-powered Chinese astrology readings and BaZi analysis",
                        "url": "https://bazigpt.com",
                        "applicationCategory": "LifestyleApplication",
                        "operatingSystem": "Web Browser",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
                        },
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.8",
                            "reviewCount": "1250"
                        }
                    })}
                </script>
            </Helmet>

            {readingMode === 'solo' ? (
                <SoloReading onModeSwitch={handleModeSwitch} />
            ) : (
                <CompatibilityReading onModeSwitch={handleModeSwitch} />
            )}

            {/* Disclaimer Dialog */}
            <Dialog
                open={disclaimerOpen}
                onClose={handleCloseDisclaimer}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <InfoIcon sx={{ color: '#ff9800', mr: 1 }} />
                        <Typography variant="h6">Important Disclaimer</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6, textAlign: 'justify' }}>
                        BaziGPT provides AI-generated readings for entertainment and self-reflection purposes only.
                        These readings are not intended to replace professional advice, medical consultation, or financial guidance.
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6, textAlign: 'justify' }}>
                        The interpretations are based on traditional Bazi principles but are generated by artificial intelligence.
                        Please use your own judgment and consult qualified professionals for important life decisions.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'justify' }}>
                        By continuing, you acknowledge that you understand this is for entertainment purposes only.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        onClick={handleCloseDisclaimer}
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
                        I Understand
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Home; 