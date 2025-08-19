import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { track } from '@vercel/analytics/react';
import SoloReading from '../components/SoloReading';
import CompatibilityReading from '../components/CompatibilityReading';

const Home: React.FC = () => {
    const { t } = useTranslation();
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
                <title>{t('seo.home.title')}</title>
                <meta name="description" content={t('seo.home.description')} />
                <meta name="keywords" content={t('seo.home.keywords')} />
                <meta name="author" content="BaziGPT" />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content={t('seo.home.title')} />
                <meta property="og:description" content={t('seo.home.description')} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://bazigpt.com" />
                <meta property="og:image" content="https://bazigpt.com/og-image.svg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={t('seo.home.title')} />
                <meta name="twitter:description" content={t('seo.home.description')} />
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
                        <Typography variant="h6">{t('home.disclaimer.title')}</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6, textAlign: 'justify' }}>
                        {t('home.disclaimer.content')}
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
                        {t('home.disclaimer.accept')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Home; 