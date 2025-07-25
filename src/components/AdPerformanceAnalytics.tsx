import React, { useEffect } from 'react';
import { track } from '@vercel/analytics/react';

interface AdPerformanceAnalyticsProps {
    pageType: string;
    contentCategory: string;
    userEngagement: number;
}

const AdPerformanceAnalytics: React.FC<AdPerformanceAnalyticsProps> = ({
    pageType,
    contentCategory,
    userEngagement
}) => {
    useEffect(() => {
        // Track key metrics for Google Ads evaluation
        track('ad_performance_metrics', {
            page_type: pageType,
            content_category: contentCategory,
            user_engagement_time: userEngagement,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            referrer: document.referrer || 'direct'
        });

        // Track content quality indicators
        track('content_quality_metrics', {
            page_load_time: performance.now(),
            dom_content_loaded: (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.domContentLoadedEventEnd || 0,
            first_contentful_paint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
        });

    }, [pageType, contentCategory, userEngagement]);

    return null; // This component doesn't render anything
};

export default AdPerformanceAnalytics; 