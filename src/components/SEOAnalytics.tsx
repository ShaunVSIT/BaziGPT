import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { track } from '@vercel/analytics/react';

interface SEOAnalyticsProps {
    pageTitle: string;
    pageDescription: string;
    keywords?: string[];
    canonicalUrl?: string;
}

export const SEOAnalytics: React.FC<SEOAnalyticsProps> = ({
    pageTitle,
    pageDescription,
    keywords = [],
    canonicalUrl
}) => {
    useEffect(() => {
        // Track page view for SEO analytics
        track('page_view', {
            page_title: pageTitle,
            page_description: pageDescription,
            keywords: keywords.join(', '),
            timestamp: new Date().toISOString()
        });

        // Note: Web Vitals tracking removed to avoid TypeScript issues
        // Core Web Vitals are automatically tracked by Vercel Analytics
    }, [pageTitle, pageDescription, keywords]);

    // Determine the canonical URL - prefer www.bazigpt.io over bazigpt.xyz
    const getCanonicalUrl = () => {
        if (canonicalUrl) return canonicalUrl;

        const currentUrl = window.location.href;
        // Always prefer www.bazigpt.io as the canonical domain (matching Vercel redirects)
        return currentUrl.replace('bazigpt.xyz', 'www.bazigpt.io').replace('//bazigpt.io', '//www.bazigpt.io');
    };

    return (
        <Helmet>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
            {keywords.length > 0 && (
                <meta name="keywords" content={keywords.join(', ')} />
            )}
            <link rel="canonical" href={getCanonicalUrl()} />

            {/* Open Graph tags */}
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:url" content={getCanonicalUrl()} />

            {/* Twitter tags */}
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />
        </Helmet>
    );
};

export default SEOAnalytics; 