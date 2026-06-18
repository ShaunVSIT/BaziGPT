import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Daily from '../components/Daily';

const DailyPage: React.FC = () => {
    const { t } = useTranslation();
    return (
        <>
            <Helmet>
                <title>{t('seo.daily.title')}</title>
                <meta name="description" content={t('seo.daily.description')} />
                <meta name="keywords" content={t('seo.daily.keywords')} />

                {/* Open Graph */}
                <meta property="og:title" content={t('seo.daily.title')} />
                <meta property="og:description" content={t('seo.daily.description')} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.bazigpt.io/daily" />
                <meta property="og:image" content="https://www.bazigpt.io/og-image.png" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={t('seo.daily.title')} />
                <meta name="twitter:description" content={t('seo.daily.description')} />
                <meta name="twitter:image" content="https://www.bazigpt.io/og-image.png" />

                {/* Canonical URL */}
                <link rel="canonical" href="https://www.bazigpt.io/daily" />
            </Helmet>
            <Daily />
        </>
    );
};

export default DailyPage; 