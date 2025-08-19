import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, IconButton, Divider } from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';

// Add this custom X icon component
const XIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" />
    </svg>
);

const Footer: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Box
            sx={{
                mt: 'auto',
                background: 'linear-gradient(to right, rgba(26,26,26,0.9), rgba(255,152,0,0.1))',
                borderTop: '1px solid rgba(255,152,0,0.2)',
                py: 2,
                px: { xs: 2, sm: 3 },
            }}
        >
            <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
                {/* Three horizontal sections */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 2, md: 4 },
                    alignItems: { xs: 'center', md: 'flex-start' },
                    justifyContent: 'space-between'
                }}>

                    {/* Section 1: Social Media */}
                    <Box sx={{
                        flex: 1,
                        textAlign: 'center',
                        minWidth: { md: '200px' }
                    }}>
                        <Typography variant="subtitle2" color="primary.main" gutterBottom>
                            📅 {t('footer.dailyForecasts')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            {t('footer.followForInsights')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton
                                href="https://x.com/bazigpt"
                                target="_blank"
                                size="large"
                                sx={{
                                    color: 'text.secondary',
                                    p: { xs: 1, sm: 0.5 },
                                    m: { xs: 0.5, sm: 0 },
                                    minWidth: 40,
                                    minHeight: 40,
                                    borderRadius: '50%',
                                    bgcolor: { xs: 'rgba(255,152,0,0.08)', sm: 'transparent' },
                                    '&:hover': {
                                        color: 'primary.main',
                                        bgcolor: 'rgba(255, 152, 0, 0.15)',
                                    },
                                    '& svg': {
                                        width: { xs: '28px', sm: '20px' },
                                        height: { xs: '28px', sm: '20px' },
                                    }
                                }}
                            >
                                <XIcon />
                            </IconButton>
                            <IconButton
                                href="https://t.me/bazigpt_everyday"
                                target="_blank"
                                size="large"
                                sx={{
                                    color: 'text.secondary',
                                    p: { xs: 1, sm: 0.5 },
                                    m: { xs: 0.5, sm: 0 },
                                    minWidth: 40,
                                    minHeight: 40,
                                    borderRadius: '50%',
                                    bgcolor: { xs: 'rgba(255,152,0,0.08)', sm: 'transparent' },
                                    '&:hover': {
                                        color: 'primary.main',
                                        bgcolor: 'rgba(255, 152, 0, 0.15)',
                                    },
                                    '& .MuiSvgIcon-root': {
                                        fontSize: { xs: '1.8rem', sm: '1.2rem' }
                                    }
                                }}
                            >
                                <TelegramIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Vertical Divider for Desktop */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Divider orientation="vertical" sx={{ height: '60px', borderColor: 'rgba(255,152,0,0.2)' }} />
                    </Box>

                    {/* Horizontal Divider for Mobile */}
                    <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }}>
                        <Divider sx={{ borderColor: 'rgba(255,152,0,0.2)' }} />
                    </Box>

                    {/* Section 2: Legal Links */}
                    <Box sx={{
                        flex: 1,
                        textAlign: 'center',
                        minWidth: { md: '200px' }
                    }}>
                        <Typography variant="subtitle2" color="primary.main" gutterBottom>
                            {t('footer.legal')}
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'center',
                            flexDirection: { xs: 'row', sm: 'row' },
                            alignItems: 'center',
                            mt: 1
                        }}>
                            <Button
                                component="a"
                                href="/privacy"
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    borderRadius: 2,
                                    borderWidth: 2,
                                    borderColor: 'primary.main',
                                    minWidth: 80,
                                    px: 2,
                                    py: 0.5,
                                    '&:hover': {
                                        color: 'white',
                                        bgcolor: 'primary.main',
                                        borderColor: 'primary.main',
                                    }
                                }}
                            >
                                {t('footer.privacy')}
                            </Button>
                            <Button
                                component="a"
                                href="/terms"
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    borderRadius: 2,
                                    borderWidth: 2,
                                    borderColor: 'primary.main',
                                    minWidth: 80,
                                    px: 2,
                                    py: 0.5,
                                    '&:hover': {
                                        color: 'white',
                                        bgcolor: 'primary.main',
                                        borderColor: 'primary.main',
                                    }
                                }}
                            >
                                {t('footer.terms')}
                            </Button>
                        </Box>
                    </Box>

                    {/* Vertical Divider for Desktop */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Divider orientation="vertical" sx={{ height: '60px', borderColor: 'rgba(255,152,0,0.2)' }} />
                    </Box>

                    {/* Horizontal Divider for Mobile */}
                    <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }}>
                        <Divider sx={{ borderColor: 'rgba(255,152,0,0.2)' }} />
                    </Box>

                    {/* Section 3: Developer Info */}
                    <Box sx={{
                        flex: 1,
                        textAlign: 'center',
                        minWidth: { md: '200px' }
                    }}>
                        <Typography variant="subtitle2" color="primary.main" gutterBottom>
                            {t('footer.developer')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            {t('footer.builtBy')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton
                                href="https://twitter.com/0xBarnum"
                                target="_blank"
                                size="large"
                                sx={{
                                    color: 'text.secondary',
                                    p: { xs: 1, sm: 0.5 },
                                    m: { xs: 0.5, sm: 0 },
                                    minWidth: 40,
                                    minHeight: 40,
                                    borderRadius: '50%',
                                    bgcolor: { xs: 'rgba(255,152,0,0.08)', sm: 'transparent' },
                                    '&:hover': {
                                        color: 'primary.main',
                                        bgcolor: 'rgba(255, 152, 0, 0.15)',
                                    },
                                    '& svg': {
                                        width: { xs: '28px', sm: '20px' },
                                        height: { xs: '28px', sm: '20px' },
                                    }
                                }}
                            >
                                <XIcon />
                            </IconButton>
                            <IconButton
                                href="https://t.me/ZeroXBarnum"
                                target="_blank"
                                size="large"
                                sx={{
                                    color: 'text.secondary',
                                    p: { xs: 1, sm: 0.5 },
                                    m: { xs: 0.5, sm: 0 },
                                    minWidth: 40,
                                    minHeight: 40,
                                    borderRadius: '50%',
                                    bgcolor: { xs: 'rgba(255,152,0,0.08)', sm: 'transparent' },
                                    '&:hover': {
                                        color: 'primary.main',
                                        bgcolor: 'rgba(255, 152, 0, 0.15)',
                                    },
                                    '& .MuiSvgIcon-root': {
                                        fontSize: { xs: '1.8rem', sm: '1.2rem' }
                                    }
                                }}
                            >
                                <TelegramIcon />
                            </IconButton>
                        </Box>
                    </Box>

                </Box>
            </Box>
        </Box>
    );
};

export default Footer; 