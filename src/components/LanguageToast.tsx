import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Slide, SlideProps } from '@mui/material';

function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction="up" />;
}

const LanguageToast: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [language, setLanguage] = useState('');

    const languageNames: { [key: string]: string } = {
        'en': 'English',
        'th': 'ไทย',
        'zh': '中文'
    };

    useEffect(() => {
        const handleLanguageChange = (event: CustomEvent) => {
            const { language: newLanguage } = event.detail;
            setLanguage(languageNames[newLanguage] || newLanguage);
            setOpen(true);
        };

        // Listen for the custom event from LanguageSwitcher
        window.addEventListener('language-preference-saved', handleLanguageChange as EventListener);

        return () => {
            window.removeEventListener('language-preference-saved', handleLanguageChange as EventListener);
        };
    }, []);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={3000}
            onClose={handleClose}
            TransitionComponent={SlideTransition}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert
                onClose={handleClose}
                severity="success"
                variant="filled"
                sx={{
                    '& .MuiAlert-icon': {
                        fontSize: '1.2rem'
                    }
                }}
            >
                Language preference saved: {language} ✨
            </Alert>
        </Snackbar>
    );
};

export default LanguageToast;
