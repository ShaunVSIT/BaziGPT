import React from 'react';
import { Analytics } from '@vercel/analytics/react';

const DevelopmentAnalytics: React.FC = () => {
    // In development, we'll still render the component but it won't make network requests
    if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Vercel Analytics: Development mode - no data will be sent');
        return (
            <Analytics
                mode="development"
                debug={true}
            />
        );
    }

    // In production, use the provided settings
    return (
        <Analytics
            mode="production"
            debug={false}
        />
    );
};

export default DevelopmentAnalytics; 