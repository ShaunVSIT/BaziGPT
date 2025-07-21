import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Typography, Paper, Container, Button } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// Navigation now handled by Layout component

const About: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>About BaziGPT - AI-Powered Bazi Readings</title>
                <meta name="description" content="Learn about BaziGPT, the AI-powered Bazi reading platform that provides personalized Chinese astrology insights." />
                <meta property="og:title" content="About BaziGPT - AI-Powered Bazi Readings" />
                <meta property="og:description" content="Learn about BaziGPT, the AI-powered Bazi reading platform." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://bazigpt.com/about" />
                <meta property="og:image" content="https://bazigpt.com/og-image.svg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="About BaziGPT - AI-Powered Bazi Readings" />
                <meta name="twitter:description" content="Learn about BaziGPT, the AI-powered Bazi reading platform." />
                <meta name="twitter:image" content="https://bazigpt.com/og-image.svg" />
            </Helmet>

            <Container maxWidth="md" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h3" component="h1" gutterBottom sx={{
                        color: '#ff9800',
                        fontWeight: 'bold',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                    }}>
                        <span style={{ fontSize: '0.9em' }}>🀄</span>
                        About BaziGPT
                        <span style={{ fontSize: '0.9em' }}>🀄</span>
                    </Typography>

                    {/* Navigation removed - now handled by Layout component */}
                </Box>

                <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, mb: 3 }}>
                    <Typography variant="h5" color="primary.main" gutterBottom>
                        What is BaziGPT?
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                        BaziGPT is an AI-powered platform that provides personalized Bazi (八字) readings based on traditional Chinese astrology principles.
                        Our advanced AI system combines ancient wisdom with modern technology to deliver insightful and accurate readings.
                    </Typography>

                    <Typography variant="h6" color="primary.main" gutterBottom>
                        Our Mission
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                        We believe that everyone deserves access to personalized insights that can help guide their life decisions.
                        By combining traditional Bazi principles with cutting-edge AI technology, we make this ancient wisdom accessible to everyone.
                    </Typography>

                    <Typography variant="h6" color="primary.main" gutterBottom>
                        How It Works
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        Simply enter your birth date and time, and our AI system will analyze your Bazi chart to provide personalized insights
                        about your personality, career, relationships, and life path. You can also get daily forecasts and compatibility readings.
                    </Typography>
                </Paper>

                {/* Types of Readings Section */}
                <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, mb: 3 }}>
                    <Typography variant="h5" color="primary.main" gutterBottom>
                        Types of Readings We Offer
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4 }}>
                        {/* Solo Reading */}
                        <Box sx={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: { sm: 360, md: 340, lg: 320 } }}>
                            <div>
                                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                                    🀄
                                </Typography>
                                <Typography variant="h6" color="primary.main" gutterBottom>
                                    Solo Reading
                                </Typography>
                                <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 2 }}>
                                    Get a personalized Bazi reading based on your birth date and time. Discover insights about your personality, strengths, challenges, and life path using traditional Chinese astrology principles, powered by AI.
                                </Typography>
                            </div>
                            <Box sx={{ mt: 'auto', pt: 2 }}>
                                <Button
                                    component={RouterLink}
                                    to="/"
                                    color="primary"
                                    variant="contained"
                                    fullWidth
                                    sx={{ fontWeight: 600 }}
                                >
                                    Try Solo Reading
                                </Button>
                            </Box>
                        </Box>
                        {/* Compatibility Reading */}
                        <Box sx={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: { sm: 360, md: 340, lg: 320 } }}>
                            <div>
                                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                                    💕
                                </Typography>
                                <Typography variant="h6" color="primary.main" gutterBottom>
                                    Compatibility Reading
                                </Typography>
                                <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 2 }}>
                                    Compare your Bazi chart with a partner, friend, or family member. Explore relationship dynamics, compatibility, and areas of harmony or challenge, all interpreted through the lens of Bazi astrology and AI.
                                </Typography>
                            </div>
                            <Box sx={{ mt: 'auto', pt: 2 }}>
                                <Button
                                    component={RouterLink}
                                    to="/?mode=compatibility"
                                    color="primary"
                                    variant="contained"
                                    fullWidth
                                    sx={{ fontWeight: 600 }}
                                >
                                    Try Compatibility Reading
                                </Button>
                            </Box>
                        </Box>
                        {/* Daily Forecast */}
                        <Box sx={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: { sm: 360, md: 340, lg: 320 } }}>
                            <div>
                                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                                    📅
                                </Typography>
                                <Typography variant="h6" color="primary.main" gutterBottom>
                                    Daily Forecast
                                </Typography>
                                <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 2 }}>
                                    Receive daily Bazi forecasts that blend ancient wisdom with AI insights. Understand the cosmic energies influencing your day and get practical tips for making the most of each day’s opportunities.
                                </Typography>
                            </div>
                            <Box sx={{ mt: 'auto', pt: 2 }}>
                                <Button
                                    component={RouterLink}
                                    to="/daily"
                                    color="primary"
                                    variant="contained"
                                    fullWidth
                                    sx={{ fontWeight: 600 }}
                                >
                                    View Daily Forecast
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, mb: 3 }}>
                    <Typography variant="h5" color="primary.main" gutterBottom>
                        What is Bazi (八字)?
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                        Bazi, also known as the Four Pillars of Destiny (四柱命理), is a traditional Chinese astrological system that analyzes
                        your birth date and time to reveal insights about your personality, destiny, and life path.
                    </Typography>

                    <Typography variant="h6" color="primary.main" gutterBottom>
                        The Four Pillars
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                        Your Bazi chart consists of four pillars representing the year, month, day, and hour of your birth. Each pillar contains
                        two characters: a Heavenly Stem (天干) and an Earthly Branch (地支). These elements interact to create a unique
                        combination that defines your character and life journey.
                    </Typography>

                    <Typography variant="h6" color="primary.main" gutterBottom>
                        The Five Elements
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                        Bazi is based on the Five Elements (五行): Wood, Fire, Earth, Metal, and Water. Each element represents different
                        aspects of your personality and life. The balance and interaction of these elements in your chart reveal your
                        strengths, weaknesses, and potential life paths.
                    </Typography>

                    <Typography variant="h6" color="primary.main" gutterBottom>
                        Modern Applications
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        While Bazi has ancient roots, its principles remain relevant today. Understanding your Bazi can help you make
                        better decisions about career choices, relationships, timing for important events, and personal development.
                        It's a tool for self-awareness and life guidance, not fortune-telling.
                    </Typography>
                </Paper>
            </Container>
        </>
    );
};

export default About; 