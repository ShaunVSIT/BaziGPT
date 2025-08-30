import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Card,
    CardActionArea,
    Grid,
    Fade
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { track } from '@vercel/analytics/react';

interface Language {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
    description: string;
}

const languages: Language[] = [
    {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        description: 'Get your Bazi reading in English'
    },
    {
        code: 'th',
        name: 'Thai',
        nativeName: 'ไทย',
        flag: '🇹🇭',
        description: 'รับการอ่านบาซี่ในภาษาไทย'
    },
    {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
        flag: '🇨🇳',
        description: '获取中文八字解读'
    }
];

const LanguageWelcomeModal: React.FC = () => {
    const { i18n, t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [step, setStep] = useState<'language' | 'disclaimer'>('language');

    useEffect(() => {
        // Check if user has completed both language selection and disclaimer
        const hasLanguagePreference = localStorage.getItem('i18nextLng');
        const hasSeenWelcome = localStorage.getItem('bazigpt_language_welcome_seen');
        const hasSeenDisclaimer = localStorage.getItem('bazigpt_disclaimer_seen');

        // Show modal if user hasn't completed the full onboarding flow
        if (!hasLanguagePreference || !hasSeenWelcome || !hasSeenDisclaimer) {
            // Small delay to let the page load first
            setTimeout(() => {
                setOpen(true);
                // Pre-select based on browser language or current setting
                const browserLang = navigator.language.split('-')[0];
                const supportedLang = languages.find(lang => lang.code === browserLang);
                setSelectedLanguage(supportedLang?.code || i18n.language || 'en');

                // If language is already set but disclaimer not seen, go directly to disclaimer
                if (hasLanguagePreference && hasSeenWelcome && !hasSeenDisclaimer) {
                    setStep('disclaimer');
                }
            }, 500);
        }
    }, [i18n.language]);

    const handleLanguageSelect = (languageCode: string) => {
        setSelectedLanguage(languageCode);
    };

    const handleLanguageContinue = () => {
        if (selectedLanguage) {
            i18n.changeLanguage(selectedLanguage);
            track('language_welcome_selected', { language: selectedLanguage });
        }
        localStorage.setItem('bazigpt_language_welcome_seen', 'true');

        // Move to disclaimer step
        setStep('disclaimer');
    };



    const handleDisclaimerAccept = () => {
        localStorage.setItem('bazigpt_disclaimer_seen', 'true');
        track('disclaimer_accepted');
        setOpen(false);

        // Dispatch event to let other components know onboarding is complete
        const event = new CustomEvent('onboarding-completed');
        window.dispatchEvent(event);
    };

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            disableEscapeKeyDown
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    border: '2px solid rgba(255, 152, 0, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
                    zIndex: 2000, // Higher than default modal z-index
                }
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Much darker backdrop
                    backdropFilter: 'blur(4px)', // Add blur effect
                    zIndex: 1999, // Ensure backdrop is below the modal but above everything else
                }
            }}
            sx={{
                zIndex: 2000, // Ensure the entire dialog is on top
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                {step === 'language' ? (
                    <>
                        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                            Welcome to BaziGPT
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Choose your preferred language
                        </Typography>
                    </>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                            <Typography variant="h4" component="div">
                                ⚠️ {t('home.disclaimer.title')}
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary">
                            {t('onboarding.disclaimerSubtitle', 'Please read and accept our terms to continue')}
                        </Typography>
                    </>
                )}
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {step === 'language' ? (
                    <Grid container spacing={2}>
                        {languages.map((language) => (
                            <Grid item xs={12} key={language.code}>
                                <Fade in={open} timeout={300 + languages.indexOf(language) * 100}>
                                    <Card
                                        elevation={selectedLanguage === language.code ? 12 : 4}
                                        sx={{
                                            border: selectedLanguage === language.code
                                                ? '2px solid #ff9800'
                                                : '2px solid rgba(255, 255, 255, 0.1)',
                                            transition: 'all 0.2s ease-in-out',
                                            transform: selectedLanguage === language.code
                                                ? 'scale(1.02)'
                                                : 'scale(1)',
                                            background: selectedLanguage === language.code
                                                ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 87, 34, 0.15) 100%)'
                                                : 'rgba(255, 255, 255, 0.05)',
                                            '&:hover': {
                                                background: selectedLanguage === language.code
                                                    ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 87, 34, 0.2) 100%)'
                                                    : 'rgba(255, 255, 255, 0.08)',
                                                transform: 'scale(1.01)',
                                            }
                                        }}
                                    >
                                        <CardActionArea
                                            onClick={() => handleLanguageSelect(language.code)}
                                            sx={{ p: 2 }}
                                        >
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Typography variant="h3" component="span">
                                                    {language.flag}
                                                </Typography>
                                                <Box flex={1}>
                                                    <Typography variant="h6" component="div">
                                                        {language.nativeName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {language.description}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardActionArea>
                                    </Card>
                                </Fade>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box sx={{ py: 2 }}>
                        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6, textAlign: 'justify' }}>
                            {t('home.disclaimer.content')}
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 2, justifyContent: 'center' }}>
                {step === 'language' ? (
                    <Button
                        onClick={handleLanguageContinue}
                        variant="contained"
                        color="primary"
                        disabled={!selectedLanguage}
                        sx={{
                            minWidth: 160,
                            fontWeight: 600,
                            fontSize: '1rem',
                            py: 1.5,
                            px: 4,
                            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
                                boxShadow: '0 4px 20px rgba(255, 152, 0, 0.4)',
                            },
                            '&:disabled': {
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.3)',
                            }
                        }}
                    >
                        Continue
                    </Button>
                ) : (
                    <Button
                        onClick={handleDisclaimerAccept}
                        variant="contained"
                        color="primary"
                        sx={{
                            minWidth: 160,
                            fontWeight: 600,
                            fontSize: '1rem',
                            py: 1.5,
                            px: 4,
                            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
                                boxShadow: '0 4px 20px rgba(255, 152, 0, 0.4)',
                            }
                        }}
                    >
                        {t('home.disclaimer.accept')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default LanguageWelcomeModal;
