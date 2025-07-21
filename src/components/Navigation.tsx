import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

interface NavigationItem {
    path: string;
    label: string;
    icon: string;
    description: string;
}

const navigationItems: NavigationItem[] = [
    {
        path: '/',
        label: 'Personal Reading',
        icon: '🀄',
        description: 'Get your personalized Bazi reading'
    },
    {
        path: '/daily',
        label: 'Daily Forecast',
        icon: '📅',
        description: 'Today\'s Bazi forecast for everyone'
    },
    {
        path: '/about',
        label: 'About',
        icon: 'ℹ️',
        description: 'Learn about BaziGPT'
    }
    // Easy to add more pages in the future:
    // {
    //     path: '/compatibility',
    //     label: 'Compatibility',
    //     icon: '💕',
    //     description: 'Check relationship compatibility'
    // },
    // {
    //     path: '/learn',
    //     label: 'Learn Bazi',
    //     icon: '📚',
    //     description: 'Learn about Bazi principles'
    // }
];

interface NavigationProps {
    variant?: 'horizontal' | 'vertical';
    showDescriptions?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
    variant = 'horizontal',
    showDescriptions = false
}) => {
    const location = useLocation();
    const currentPath = location.pathname;

    const isActive = (path: string) => {
        if (path === '/') {
            return currentPath === '/' || currentPath === '';
        }
        return currentPath === path;
    };

    if (variant === 'horizontal') {
        return (
            <Box sx={{
                display: 'flex',
                gap: { xs: 1.5, sm: 2, md: 3 },
                justifyContent: 'center',
                flexWrap: 'wrap',
                mb: { xs: 2, sm: 3, md: 4 }
            }}>
                {navigationItems.map((item) => (
                    <Button
                        key={item.path}
                        href={item.path}
                        variant={isActive(item.path) ? 'contained' : 'outlined'}
                        sx={{
                            minWidth: { xs: '120px', sm: '140px', md: '160px' },
                            py: { xs: 1, sm: 1.5, md: 2 },
                            px: { xs: 2, sm: 3, md: 4 },
                            borderRadius: { xs: 2, sm: 2.5, md: 3 },
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                            fontWeight: 600,
                            textTransform: 'none',
                            borderColor: isActive(item.path) ? 'transparent' : 'rgba(255, 152, 0, 0.4)',
                            color: isActive(item.path) ? 'white' : '#ff9800',
                            background: isActive(item.path)
                                ? 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)'
                                : 'transparent',
                            boxShadow: isActive(item.path)
                                ? '0 4px 15px rgba(255, 152, 0, 0.4)'
                                : 'none',
                            '&:hover': {
                                borderColor: '#ff9800',
                                color: '#ff9800',
                                bgcolor: isActive(item.path)
                                    ? 'linear-gradient(135deg, #ff9800 20%, #ff5722 100%)'
                                    : 'rgba(255, 152, 0, 0.1)',
                                transform: { xs: 'none', sm: 'translateY(-1px)', md: 'translateY(-2px)' },
                                boxShadow: isActive(item.path)
                                    ? '0 6px 20px rgba(255, 152, 0, 0.5)'
                                    : '0 2px 8px rgba(255, 152, 0, 0.2)',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1, md: 1.5 } }}>
                            <span style={{ fontSize: '1.2em' }}>{item.icon}</span>
                            <Typography variant="body2" sx={{
                                fontWeight: 600
                            }}>
                                {item.label}
                            </Typography>
                        </Box>
                    </Button>
                ))}
            </Box>
        );
    }

    // Vertical variant for sidebar-like navigation
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            width: '100%',
            maxWidth: '300px'
        }}>
            {navigationItems.map((item) => (
                <Button
                    key={item.path}
                    href={item.path}
                    variant={isActive(item.path) ? 'contained' : 'outlined'}
                    fullWidth
                    sx={{
                        justifyContent: 'flex-start',
                        py: 2,
                        px: 3,
                        borderRadius: 2,
                        borderColor: isActive(item.path) ? 'transparent' : 'rgba(255, 152, 0, 0.3)',
                        color: isActive(item.path) ? 'white' : '#ff9800',
                        background: isActive(item.path)
                            ? 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)'
                            : 'transparent',
                        '&:hover': {
                            borderColor: '#ff9800',
                            color: '#ff9800',
                            bgcolor: isActive(item.path)
                                ? 'linear-gradient(45deg, #ff9800 60%, #ff5722 90%)'
                                : 'rgba(255, 152, 0, 0.1)',
                        },
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        width: '100%',
                        textAlign: 'left'
                    }}>
                        <span style={{ fontSize: '1.2em', flexShrink: 0 }}>{item.icon}</span>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {item.label}
                            </Typography>
                            {showDescriptions && (
                                <Typography variant="caption" sx={{
                                    color: isActive(item.path) ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                                    fontSize: '0.7rem'
                                }}>
                                    {item.description}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Button>
            ))}
        </Box>
    );
};

export default Navigation; 