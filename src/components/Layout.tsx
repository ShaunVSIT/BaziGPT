import React from 'react';
import { Box, Container } from '@mui/material';
import Footer from './Footer';
import CompactNavigation from './CompactNavigation';

// Toggle this flag to enable/disable ad spaces
const showAds = false;

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Compact Navigation Bar */}
            <CompactNavigation />

            {/* Top Ad Zone - Above Content */}
            {showAds && (
                <Box sx={{
                    width: '100%',
                    minHeight: '90px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'rgba(255, 152, 0, 0.05)',
                    borderBottom: '1px solid rgba(255, 152, 0, 0.1)'
                }}>
                    <ins className="adsbygoogle"
                        style={{ display: 'block' }}
                        data-ad-client="ca-pub-1907087767584566"
                        data-ad-slot="your-top-ad-slot"
                        data-ad-format="auto"
                        data-full-width-responsive="true">
                    </ins>
                </Box>
            )}

            <Container maxWidth="md" sx={{ py: 2, flex: 1 }}>
                {children}
            </Container>

            {/* Bottom Ad Zone - Below Content */}
            {showAds && (
                <Box sx={{
                    width: '100%',
                    minHeight: '90px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'rgba(255, 152, 0, 0.05)',
                    borderTop: '1px solid rgba(255, 152, 0, 0.1)'
                }}>
                    <ins className="adsbygoogle"
                        style={{ display: 'block' }}
                        data-ad-client="ca-pub-1907087767584566"
                        data-ad-slot="your-bottom-ad-slot"
                        data-ad-format="auto"
                        data-full-width-responsive="true">
                    </ins>
                </Box>
            )}

            {/* Unified Footer */}
            <Footer />
        </Box>
    );
};

export default Layout; 