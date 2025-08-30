import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import SoloReading from '../components/SoloReading';
import CompatibilityReading from '../components/CompatibilityReading';

const Home: React.FC = () => {
    const { t } = useTranslation();
    const [readingMode, setReadingMode] = useState<'solo' | 'compatibility'>('solo');

    // Switch to compatibility mode if ?mode=compatibility is present
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'compatibility') {
            setReadingMode('compatibility');
        }
    }, []);

    const handleModeSwitch = (newMode: 'solo' | 'compatibility') => {
        setReadingMode(newMode);
    };



    return (
        <>
            <Helmet>
                <title>{t('seo.home.title')}</title>
                <meta name="description" content={t('seo.home.description')} />
                <meta name="keywords" content={t('seo.home.keywords')} />
                <meta name="author" content="BaziGPT" />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content={t('seo.home.title')} />
                <meta property="og:description" content={t('seo.home.description')} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://bazigpt.com" />
                <meta property="og:image" content="https://bazigpt.com/og-image.svg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={t('seo.home.title')} />
                <meta name="twitter:description" content={t('seo.home.description')} />
                <meta name="twitter:image" content="https://bazigpt.com/og-image.svg" />

                {/* Additional SEO for Google Ads */}
                <meta name="google-site-verification" content="your-verification-code" />
                <meta name="msvalidate.01" content="your-bing-verification-code" />
                <link rel="canonical" href="https://bazigpt.com" />

                {/* Structured Data for Better Search Visibility */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "BaziGPT",
                        "description": "AI-powered Chinese astrology readings and BaZi analysis",
                        "url": "https://bazigpt.com",
                        "applicationCategory": "LifestyleApplication",
                        "operatingSystem": "Web Browser",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
                        },
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.8",
                            "reviewCount": "1250"
                        }
                    })}
                </script>
            </Helmet>

            {readingMode === 'solo' ? (
                <SoloReading onModeSwitch={handleModeSwitch} />
            ) : (
                <CompatibilityReading onModeSwitch={handleModeSwitch} />
            )}
        </>
    );
};

export default Home; 