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
        // Scroll to top so the hero's entrance animations play in view.
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
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
                <meta property="og:url" content="https://www.bazigpt.io/" />
                <meta property="og:image" content="https://www.bazigpt.io/og-image.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={t('seo.home.title')} />
                <meta name="twitter:description" content={t('seo.home.description')} />
                <meta name="twitter:image" content="https://www.bazigpt.io/og-image.png" />
                <link rel="canonical" href="https://www.bazigpt.io/" />

                {/* Structured Data for Better Search Visibility */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "BaziGPT",
                        "description": "AI-powered Chinese astrology readings and BaZi analysis",
                        "url": "https://www.bazigpt.io/",
                        "applicationCategory": "LifestyleApplication",
                        "operatingSystem": "Web Browser",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
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