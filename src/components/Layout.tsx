import React from 'react';
import { Box, Container } from '@mui/material';
import Footer from './Footer';
import CompactNavigation from './CompactNavigation';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Compact Navigation Bar */}
            <CompactNavigation />

            <Container maxWidth="md" sx={{ py: 2, flex: 1 }}>
                {children}
            </Container>

            {/* Unified Footer */}
            <Footer />
        </Box>
    );
};

export default Layout; 