import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  CircularProgress,
  Box,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SpeedInsights } from "@vercel/speed-insights/react";
import DevelopmentAnalytics from './components/DevelopmentAnalytics';
import SEOAnalytics from './components/SEOAnalytics';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import LanguageWelcomeModal from './components/LanguageWelcomeModal';
import LanguageToast from './components/LanguageToast';
import routes from './routes';
import './i18n';

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

// Loading component for lazy-loaded routes
const LoadingSpinner: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh',
    }}
  >
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Router>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {routes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={<route.component />}
                    />
                  ))}
                </Routes>
              </Suspense>
            </Layout>
            <LanguageWelcomeModal />
            <LanguageToast />
          </Router>
        </LocalizationProvider>
        <SpeedInsights />
        <DevelopmentAnalytics />
        <SEOAnalytics
          pageTitle="BaziGPT - AI-Powered Chinese Astrology & Relationship Compatibility"
          pageDescription="Get personalized Chinese Astrology readings and relationship compatibility analysis powered by AI. Discover your destiny, personality traits, and relationship compatibility based on your birth date and time."
          keywords={[
            "Chinese astrology", "BaZi", "destiny reading", "birth chart", "relationship compatibility", "AI astrology", "free reading"
          ]}
        />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
