import React from 'react';
import { Box, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';

interface ShareCardBaseProps {
    title: string;
    children: React.ReactNode;
    qrValue: string;
    subtitle?: string;
}

const ShareCardBase: React.FC<ShareCardBaseProps> = ({ title, children, qrValue, subtitle }) => (
    <Box
        sx={{
            bgcolor: '#121212',
            borderRadius: 2,
            p: 3,
            mb: 3,
            border: '1px solid rgba(255, 152, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center', // Center all text
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #ff9800, #ff5722)',
            }
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #ff9800, #ff5722)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                }}
            >
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                    八字
                </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                BaziGPT
            </Typography>
        </Box>
        <Typography variant="h5" sx={{ color: '#ff9800', mb: 2, fontWeight: 'bold' }}>
            {title}
        </Typography>
        {subtitle && (
            <Typography variant="body2" sx={{ color: 'white', mb: 2 }}>
                {subtitle}
            </Typography>
        )}
        <Box sx={{ width: '100%', textAlign: 'center' }}>
            {children}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 600 }}>
                Get your own reading at bazigpt.xyz
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <QRCodeSVG
                    value={qrValue}
                    size={40}
                    level="M"
                    fgColor="#ff9800"
                    bgColor="transparent"
                />
                <Typography variant="caption" sx={{ color: 'white', mt: 0.5 }}>
                    Scan to get your reading
                </Typography>
            </Box>
        </Box>
    </Box>
);

export default ShareCardBase; 