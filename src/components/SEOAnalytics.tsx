import React, { useEffect } from 'react';
import { track } from '@vercel/analytics/react';

interface SEOAnalyticsProps {
    pageTitle: string;
    pageDescription: string;
    keywords?: string[];
}

export const SEOAnalytics: React.FC<SEOAnalyticsProps> = ({
    pageTitle,
    pageDescription,
    keywords = []
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

    return null; // This component doesn't render anything
};

export default SEOAnalytics; 