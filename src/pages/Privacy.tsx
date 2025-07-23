import React from 'react';
import { Helmet } from 'react-helmet-async';
import Privacy from '../components/Privacy';

const PrivacyPage: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>Privacy Policy - BaziGPT</title>
                <meta name="description" content="Learn how BaziGPT protects your privacy and handles your personal data. We are committed to keeping your information secure, private, and never shared." />
                <meta name="keywords" content="privacy policy, data protection, personal data, privacy, BaziGPT privacy, Chinese astrology privacy, data security" />

                {/* Open Graph */}
                <meta property="og:title" content="Privacy Policy - BaziGPT" />
                <meta property="og:description" content="Learn about how BaziGPT protects your privacy and handles your personal data. We are committed to keeping your information secure and private." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://bazigpt.com/privacy" />
                <meta property="og:image" content="https://bazigpt.com/og-image.svg" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Privacy Policy - BaziGPT" />
                <meta name="twitter:description" content="Learn about how BaziGPT protects your privacy and handles your personal data. We are committed to keeping your information secure and private." />
                <meta name="twitter:image" content="https://bazigpt.com/og-image.svg" />

                {/* Canonical URL */}
                <link rel="canonical" href="https://bazigpt.com/privacy" />
            </Helmet>
            <Privacy />
        </>
    );
};

export default PrivacyPage; 