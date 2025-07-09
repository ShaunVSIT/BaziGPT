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

const Terms: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <Helmet>
                <title>Terms of Service - BaziGPT</title>
                <meta name="description" content="Terms of Service for BaziGPT - Read our terms and conditions." />
                <link rel="canonical" href="https://bazigpt.com/terms" />
            </Helmet>
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
                        Terms of Service
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        <strong>Last updated:</strong> January 2024
                    </Typography>

                    <Box sx={{ '& h2': { color: 'primary.main', mt: 4, mb: 2 }, '& p': { mb: 2 }, '& ul': { mb: 2 } }}>
                        <Typography variant="h5" component="h2">
                            Acceptance of Terms
                        </Typography>
                        <Typography variant="body1">
                            By using BaziGPT, you agree to these terms of service.
                        </Typography>

                        <Typography variant="h5" component="h2">
                            Service Description
                        </Typography>
                        <Typography variant="body1">
                            BaziGPT provides AI-powered Chinese astrology readings based on your birth date and time. This service is for entertainment purposes only.
                        </Typography>

                        <Typography variant="h5" component="h2">
                            Disclaimer
                        </Typography>
                        <Typography variant="body1">
                            <strong>Important:</strong> The readings provided by BaziGPT are for entertainment purposes only. They should not be considered as professional advice, medical guidance, or factual predictions. Do not make important life decisions based solely on these readings.
                        </Typography>

                        <Typography variant="h5" component="h2">
                            User Responsibilities
                        </Typography>
                        <Box component="ul" sx={{ pl: 3 }}>
                            <Typography component="li">Provide accurate birth information</Typography>
                            <Typography component="li">Use the service responsibly</Typography>
                            <Typography component="li">Not rely on readings for critical decisions</Typography>
                            <Typography component="li">Respect the entertainment nature of the service</Typography>
                        </Box>

                        <Typography variant="h5" component="h2">
                            Limitation of Liability
                        </Typography>
                        <Typography variant="body1">
                            BaziGPT is provided "as is" without any warranties. We are not liable for any decisions made based on the readings provided.
                        </Typography>

                        <Typography variant="h5" component="h2">
                            Intellectual Property
                        </Typography>
                        <Typography variant="body1">
                            The BaziGPT service and its content are protected by copyright and other intellectual property laws.
                        </Typography>

                        <Typography variant="h5" component="h2">
                            Changes to Terms
                        </Typography>
                        <Typography variant="body1">
                            We may update these terms from time to time. Continued use of the service constitutes acceptance of any changes.
                        </Typography>

                        <Typography variant="h5" component="h2">
                            Contact
                        </Typography>
                        <Typography variant="body1">
                            For questions about these terms, contact us at{' '}
                            <a href="https://twitter.com/0xBarnum" target="_blank" rel="noopener noreferrer" style={{ color: '#ff9800' }}>
                                @0xBarnum
                            </a>{' '}
                            on Twitter.
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </ThemeProvider>
    );
};

export default Terms; 