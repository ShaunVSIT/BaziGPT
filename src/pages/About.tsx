import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper, Container, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
// Navigation now handled by Layout component

const About: React.FC = () => {
    const { t } = useTranslation();
    return (
        <>
            <Helmet>
                <title>{t('seo.about.title')}</title>
                <meta name="description" content={t('seo.about.description')} />
                <meta property="og:title" content={t('seo.about.title')} />
                <meta property="og:description" content={t('seo.about.description')} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://bazigpt.com/about" />
                <meta property="og:image" content="https://bazigpt.com/og-image.svg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={t('seo.about.title')} />
                <meta name="twitter:description" content={t('seo.about.description')} />
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
                        {t('about.title')}
                        <span style={{ fontSize: '0.9em' }}>🀄</span>
                    </Typography>

                    {/* Navigation removed - now handled by Layout component */}
                </Box>

                <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, mb: 3 }}>
                    <Typography variant="h5" color="primary.main" gutterBottom>
                        {t('about.whatIsBaziGPT')}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                        {t('about.whatIsBaziGPTDescription')}
                    </Typography>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                        {t('about.howItWorks')}
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {t('about.howItWorksDescription')}
                    </Typography>
                </Paper>

                {/* Types of Readings Section */}
                <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, mb: 3 }}>
                    <Typography variant="h5" color="primary.main" gutterBottom>
                        {t('about.typesOfReadings')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4 }}>
                        {/* Solo Reading */}
                        <Box sx={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: { sm: 360, md: 340, lg: 320 } }}>
                            <div>
                                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                                    🀄
                                </Typography>
                                <Typography variant="h6" color="primary.main" gutterBottom>
                                    {t('about.soloReading')}
                                </Typography>
                                <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 2 }}>
                                    {t('about.soloReadingDescription')}
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
                                    {t('about.trySoloReading')}
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
                                    {t('about.compatibilityReading')}
                                </Typography>
                                <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 2 }}>
                                    {t('about.compatibilityReadingDescription')}
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
                                    {t('about.tryCompatibilityReading')}
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
                                    {t('about.dailyForecast')}
                                </Typography>
                                <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 2 }}>
                                    {t('about.dailyForecastDescription')}
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
                                    {t('about.viewDailyForecast')}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, mb: 3 }}>
                    <Typography variant="h5" color="primary.main" gutterBottom>
                        {t('about.whatIsBazi')}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                        {t('about.whatIsBaziDescription')}
                    </Typography>

                    <Typography variant="h6" color="primary.main" gutterBottom>
                        {t('about.fourPillars')}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                        {t('about.fourPillarsDescription')}
                    </Typography>

                    <Typography variant="h6" color="primary.main" gutterBottom>
                        {t('about.fiveElements')}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                        {t('about.fiveElementsDescription')}
                    </Typography>

                    <Typography variant="h6" color="primary.main" gutterBottom>
                        {t('about.modernApplications')}
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {t('about.modernApplicationsDescription')}
                    </Typography>
                </Paper>
            </Container>
        </>
    );
};

export default About; 