import React from 'react';
import { Helmet } from 'react-helmet-async';
import Terms from '../components/Terms';

const TermsPage: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>Terms of Service - BaziGPT</title>
                <meta name="description" content="Read our terms of service and understand the conditions for using BaziGPT. Learn about your rights and responsibilities when using our AI-powered astrology service." />
                <meta name="keywords" content="terms of service, terms and conditions, BaziGPT terms, service agreement, user agreement, Chinese astrology terms" />

                {/* Open Graph */}
                <meta property="og:title" content="Terms of Service - BaziGPT" />
                <meta property="og:description" content="Read our terms of service and understand the conditions for using BaziGPT. Learn about your rights and responsibilities when using our AI-powered astrology service." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://bazigpt.com/terms" />
                <meta property="og:image" content="https://bazigpt.com/og-image.svg" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Terms of Service - BaziGPT" />
                <meta name="twitter:description" content="Read our terms of service and understand the conditions for using BaziGPT. Learn about your rights and responsibilities when using our AI-powered astrology service." />
                <meta name="twitter:image" content="https://bazigpt.com/og-image.svg" />

                {/* Canonical URL */}
                <link rel="canonical" href="https://bazigpt.com/terms" />
            </Helmet>
            <Terms />
        </>
    );
};

export default TermsPage; 