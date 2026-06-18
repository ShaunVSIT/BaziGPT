import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import DevelopmentAnalytics from './components/DevelopmentAnalytics';
import SEOAnalytics from './components/SEOAnalytics';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import LanguageWelcomeModal from './components/LanguageWelcomeModal';
import LanguageToast from './components/LanguageToast';
import routes from './routes';
import './i18n';

// Loading fallback for lazy-loaded routes
const LoadingSpinner = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Loader2 className="size-8 animate-spin text-primary" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
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
      <SpeedInsights />
      <DevelopmentAnalytics />
      <SEOAnalytics
        pageTitle="BaziGPT - AI-Powered Chinese Astrology & Relationship Compatibility"
        pageDescription="Get personalized Chinese Astrology readings and relationship compatibility analysis powered by AI. Discover your destiny, personality traits, and relationship compatibility based on your birth date and time."
        keywords={[
          "Chinese astrology", "BaZi", "destiny reading", "birth chart", "relationship compatibility", "AI astrology", "free reading"
        ]}
        canonicalUrl="https://www.bazigpt.io/"
      />
    </ErrorBoundary>
  );
}

export default App;
