import React from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    ThemeProvider,
    createTheme,
    CssBaseline,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SEOAnalytics from './SEOAnalytics';


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

const Privacy: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <Helmet>
                <title>Privacy Policy - BaziGPT</title>
                <meta name="description" content="Privacy Policy for BaziGPT - Learn how we protect your data and privacy." />
                <link rel="canonical" href="https://bazigpt.com/privacy" />
            </Helmet>
            <SEOAnalytics
                pageTitle="Privacy Policy - BaziGPT"
                pageDescription="Privacy Policy for BaziGPT - Learn how we protect your data and privacy."
                keywords={["privacy policy", "data protection", "BaziGPT privacy", "user privacy"]}
            />
            <CssBaseline />
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => window.history.back()}
                    sx={{ mb: 3 }}
                >
                    Back
                </Button>

                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                    <Typography variant="h3" component="h1" gutterBottom color="primary.main">
                        Privacy Policy
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        <strong>Last updated:</strong> July 2025
                    </Typography>

                    <Box sx={{ '& h2': { color: 'primary.main', mt: 4, mb: 2 }, '& p': { mb: 2 }, '& ul': { mb: 2 } }}>
                        <Typography variant="h5" component="h2">
                            Information We Collect
                        </Typography>
                        <Typography variant="body1">
                            BaziGPT only collects the minimum information necessary to provide your Chinese astrology reading:
                        </Typography>
                        <Box component="ul" sx={{ pl: 3 }}>
                            <Typography component="li">Birth date (required)</Typography>
                            <Typography component="li">Birth time (optional)</Typography>
                        </Box>

                        <Typography variant="h5" component="h2">
                            How We Use Your Information
                        </Typography>
                        <Typography variant="body1">
                            Your birth information is used solely to:
                        </Typography>
                        <Box component="ul" sx={{ pl: 3 }}>
                            <Typography component="li">Generate your personalized BaZi reading</Typography>
                            <Typography component="li">Provide follow-up insights about specific life areas</Typography>
                        </Box>

                        <Typography variant="h5" component="h2">
                            Data Storage
                        </Typography>
                        <Typography variant="body1">
                            We do not store any of your personal information. Your birth data is processed in real-time to generate your reading and is not saved to our servers.
                        </Typography>

                        <Typography variant="h5" component="h2">
                            Third-Party Services
                        </Typography>
                        <Typography variant="body1">
                            We use OpenAI's API to generate readings. Your birth information is sent to OpenAI for processing but is not stored by them.
                        </Typography>

                        <Typography variant="h5" component="h2">
                            Analytics
                        </Typography>
                        <Typography variant="body1">
                            We use Vercel Analytics to understand how our service is used. This data is anonymous and does not include personal information.
                        </Typography>

                        <Typography variant="h5" component="h2">
                            Contact
                        </Typography>
                        <Typography variant="body1">
                            If you have questions about this privacy policy, please contact me on Telegram at{' '}
                            <a href="https://t.me/ZeroXBarnum" target="_blank" rel="noopener noreferrer" style={{ color: '#ff9800' }}>
                                @ZeroXBarnum
                            </a>.
                        </Typography>
                    </Box>
                </Paper>


            </Container>
        </ThemeProvider>
    );
};

export default Privacy; 