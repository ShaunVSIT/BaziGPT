import React from 'react';
import { Helmet } from 'react-helmet-async';
import Daily from '../components/Daily';

const DailyPage: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>Daily Bazi Forecast - BaziGPT</title>
                <meta name="description" content="Get your daily Chinese astrology forecast and insights. Discover what the stars have in store for you today with our AI-powered Bazi readings." />
                <meta name="keywords" content="daily bazi, daily forecast, Chinese astrology, daily horoscope, bazi reading, daily reading, Chinese daily forecast, bazi daily, daily Chinese astrology" />

                {/* Open Graph */}
                <meta property="og:title" content="Daily Bazi Forecast - BaziGPT" />
                <meta property="og:description" content="Get your daily Chinese astrology forecast and insights. Discover what the stars have in store for you today with our AI-powered Bazi readings." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://bazigpt.com/daily" />
                <meta property="og:image" content="https://bazigpt.com/og-image.svg" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Daily Bazi Forecast - BaziGPT" />
                <meta name="twitter:description" content="Get your daily Chinese astrology forecast and insights. Discover what the stars have in store for you today with our AI-powered Bazi readings." />
                <meta name="twitter:image" content="https://bazigpt.com/og-image.svg" />

                {/* Canonical URL */}
                <link rel="canonical" href="https://bazigpt.com/daily" />
            </Helmet>
            <Daily />
        </>
    );
};

export default DailyPage; 