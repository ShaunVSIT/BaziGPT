import { useEffect } from 'react';
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

        // Track Core Web Vitals if available
        if ('web-vital' in window) {
            import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                const trackWebVital = (metric: any) => {
                    track('web_vital', {
                        name: metric.name,
                        value: metric.value,
                        rating: metric.rating
                    });
                };

                getCLS(trackWebVital);
                getFID(trackWebVital);
                getFCP(trackWebVital);
                getLCP(trackWebVital);
                getTTFB(trackWebVital);
            });
        }
    }, [pageTitle, pageDescription, keywords]);

    return null; // This component doesn't render anything
};

export default SEOAnalytics; 