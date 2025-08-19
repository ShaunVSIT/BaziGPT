import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { track } from '@vercel/analytics/react';

interface Language {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
}

const languages: Language[] = [
    {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸'
    },
    {
        code: 'th',
        name: 'Thai',
        nativeName: 'ไทย',
        flag: '🇹🇭'
    },
    {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
        flag: '🇨🇳'
    }
];

interface LanguageSwitcherProps {
    onLanguageChange?: () => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onLanguageChange }) => {
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageChange = (languageCode: string) => {
        i18n.changeLanguage(languageCode);
        track('language_changed', { language: languageCode });
        handleClose();
        onLanguageChange?.(); // Call the callback if provided
    };

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    return (
        <Box>
            <Button
                onClick={handleClick}
                startIcon={<LanguageIcon />}
                sx={{
                    color: 'text.primary',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                }}
            >
                <Typography variant="body2" sx={{ mr: 1 }}>
                    {currentLanguage.flag}
                </Typography>
                <Typography variant="body2">
                    {currentLanguage.nativeName}
                </Typography>
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        bgcolor: '#1e1e1e',
                        color: 'white',
                        mt: 1,
                        '& .MuiMenuItem-root': {
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            }
                        }
                    }
                }}
            >
                {languages.map((language) => (
                    <MenuItem
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        selected={language.code === i18n.language}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            minWidth: 120
                        }}
                    >
                        <Typography variant="body1">
                            {language.flag}
                        </Typography>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {language.nativeName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {language.name}
                            </Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export default LanguageSwitcher; 