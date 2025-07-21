import React, { lazy } from 'react';

// Lazy load all page components for code splitting
const Home = lazy(() => import('../pages/Home'));
const Daily = lazy(() => import('../pages/Daily'));
const Privacy = lazy(() => import('../pages/Privacy'));
const Terms = lazy(() => import('../pages/Terms'));
const About = lazy(() => import('../pages/About'));
const TestError = lazy(() => import('../pages/TestError'));

export interface RouteConfig {
    path: string;
    component: React.LazyExoticComponent<React.ComponentType>;
    title: string;
    description: string;
}

export const routes: RouteConfig[] = [
    {
        path: '/',
        component: Home,
        title: 'BaziGPT - AI-Powered Chinese Astrology & Relationship Compatibility',
        description: 'Get personalized Chinese Astrology readings and relationship compatibility analysis powered by AI. Discover your destiny, personality traits, and relationship compatibility based on your birth date and time.'
    },
    {
        path: '/daily',
        component: Daily,
        title: 'Daily Bazi Forecast - BaziGPT',
        description: 'Get your daily Chinese astrology forecast and insights. Discover what the stars have in store for you today with our AI-powered Bazi readings.'
    },
    {
        path: '/about',
        component: About,
        title: 'About BaziGPT - AI-Powered Chinese Astrology',
        description: 'Learn about BaziGPT, the AI-powered Chinese astrology platform that provides personalized readings and relationship compatibility analysis.'
    },
    {
        path: '/privacy',
        component: Privacy,
        title: 'Privacy Policy - BaziGPT',
        description: 'Learn about how BaziGPT protects your privacy and handles your personal data. We are committed to keeping your information secure and private.'
    },
    {
        path: '/terms',
        component: Terms,
        title: 'Terms of Service - BaziGPT',
        description: 'Read our terms of service and understand the conditions for using BaziGPT. Learn about your rights and responsibilities when using our AI-powered astrology service.'
    },
    // Only add the test-error route in development
    ...(
        process.env.NODE_ENV === 'development'
            ? [{
                path: '/test-error',
                component: TestError,
                title: 'Test ErrorBoundary',
                description: 'This route intentionally throws an error to test the ErrorBoundary.'
            }]
            : []
    )
];

export default routes; 