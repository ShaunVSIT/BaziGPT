import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    useTheme,
    useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface NavigationItem {
    path: string;
    label: string;
    icon: string;
    description: string;
}

const CompactNavigation: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const navigationItems: NavigationItem[] = [
        {
            path: '/',
            label: t('navigation.home'),
            icon: '🀄',
            description: t('home.discoverDestiny')
        },
        {
            path: '/daily',
            label: t('navigation.daily'),
            icon: '📅',
            description: t('daily.subtitle')
        },
        {
            path: '/famous',
            label: t('navigation.famous'),
            icon: '🌟',
            description: t('famous.subtitle')
        },
        {
            path: '/about',
            label: t('navigation.about'),
            icon: 'ℹ️',
            description: t('about.subtitle')
        }
    ];

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/' || location.pathname === '';
        }
        return location.pathname === path;
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setMobileOpen(false);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Mobile drawer content
    const drawer = (
        <Box sx={{ width: 250 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 152, 0, 0.2)' }}>
                <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                    🀄 BaziGPT
                </Typography>
            </Box>
            <List>
                {navigationItems.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton
                            onClick={() => handleNavigation(item.path)}
                            selected={isActive(item.path)}
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                    borderRight: '3px solid #ff9800',
                                },
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 152, 0, 0.05)',
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                <span style={{ fontSize: '1.2em' }}>{item.icon}</span>
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                secondary={item.description}
                                primaryTypographyProps={{
                                    fontWeight: isActive(item.path) ? 600 : 400,
                                    color: isActive(item.path) ? '#ff9800' : 'inherit'
                                }}
                                secondaryTypographyProps={{
                                    fontSize: '0.75rem',
                                    color: 'text.secondary'
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            {/* Language Switcher in Mobile Drawer */}
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 152, 0, 0.2)' }}>
                <LanguageSwitcher onLanguageChange={() => setMobileOpen(false)} />
            </Box>
        </Box>
    );

    return (
        <>
            <AppBar
                position="static"
                sx={{
                    backgroundColor: 'rgba(26, 26, 26, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255, 152, 0, 0.2)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
            >
                <Toolbar sx={{ justifyContent: isMobile ? 'space-between' : 'center', minHeight: { xs: 56, sm: 56, md: 48 } }}>
                    {/* Desktop: Centered nav, no logo */}
                    {!isMobile && (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {navigationItems.map((item) => (
                                <Button
                                    key={item.path}
                                    onClick={() => handleNavigation(item.path)}
                                    variant={isActive(item.path) ? 'contained' : 'text'}
                                    sx={{
                                        color: isActive(item.path) ? 'white' : '#ff9800',
                                        backgroundColor: isActive(item.path)
                                            ? 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)'
                                            : 'transparent',
                                        '&:hover': {
                                            backgroundColor: isActive(item.path)
                                                ? 'linear-gradient(135deg, #ff9800 20%, #ff5722 100%)'
                                                : 'rgba(255, 152, 0, 0.1)',
                                        },
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        px: 2,
                                        py: { xs: 1, md: 0.5 },
                                        fontSize: { xs: '1.1rem', md: '1rem' },
                                        minHeight: 0
                                    }}
                                >
                                    <span style={{ fontSize: '1em', marginRight: '0.4rem' }}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </Button>
                            ))}
                            {/* Language Switcher for Desktop */}
                            <Box sx={{ ml: 2 }}>
                                <LanguageSwitcher />
                            </Box>
                        </Box>
                    )}

                    {/* Mobile: Logo and hamburger menu */}
                    {isMobile && (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#ff9800',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleNavigation('/')}
                                >
                                    🀄 BaziGPT
                                </Typography>
                            </Box>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="end"
                                onClick={handleDrawerToggle}
                                sx={{ color: '#ff9800' }}
                            >
                                <MenuIcon />
                            </IconButton>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better mobile performance
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: 250,
                        backgroundColor: '#1e1e1e',
                        borderLeft: '1px solid rgba(255, 152, 0, 0.2)'
                    },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
};

export default CompactNavigation; 