import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';

// Add this custom X icon component
const XIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" />
    </svg>
);

const SocialFooter: React.FC = () => {
    // Add debugging logs
    React.useEffect(() => {
        console.log('SocialFooter: Component mounted');
        return () => {
            console.log('SocialFooter: Component unmounted');
        };
    }, []);

    // Add error boundary
    try {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    mb: 3,
                    p: 3,
                    bgcolor: 'rgba(255, 152, 0, 0.05)',
                    borderRadius: 2,
                    border: '1px solid rgba(255, 152, 0, 0.2)',
                    // Add more explicit styling to ensure visibility
                    position: 'relative',
                    zIndex: 1,
                    minHeight: '120px', // Ensure minimum height
                    opacity: 1, // Explicitly set opacity
                    visibility: 'visible', // Explicitly set visibility
                }}
                data-testid="social-footer" // Add test ID for debugging
            >
                <Typography
                    variant="h6"
                    sx={{
                        color: 'primary.main',
                        fontWeight: 600,
                        textAlign: 'center',
                        mb: 1
                    }}
                >
                    📅 Get Daily Bazi Forecasts
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.secondary',
                        textAlign: 'center',
                        mb: 2,
                        maxWidth: '500px'
                    }}
                >
                    Follow us on social media for daily Bazi forecasts, insights, and Chinese astrology wisdom delivered straight to your feed!
                </Typography>

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    flexWrap: 'wrap'
                }}>
                    <Button
                        component="a"
                        href="https://x.com/bazigpt"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        color="primary"
                        startIcon={<XIcon />}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            textTransform: 'none',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                                borderColor: '#ff5722',
                                color: '#ff5722',
                                bgcolor: 'rgba(255, 152, 0, 0.1)',
                            }
                        }}
                    >
                        Follow on X
                    </Button>
                    <Button
                        component="a"
                        href="https://t.me/bazigpt_everyday"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        color="primary"
                        startIcon={<TelegramIcon />}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            textTransform: 'none',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                                borderColor: '#ff5722',
                                color: '#ff5722',
                                bgcolor: 'rgba(255, 152, 0, 0.1)',
                            }
                        }}
                    >
                        Join Telegram
                    </Button>
                </Box>
            </Box>
        );
    } catch (error) {
        console.error('SocialFooter: Error rendering component:', error);
        return (
            <Box sx={{ p: 2, bgcolor: 'error.main', color: 'white' }}>
                Error loading social footer
            </Box>
        );
    }
};

export default SocialFooter; 