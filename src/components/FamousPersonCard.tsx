import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { FamousPerson } from '../pages/Famous';
import { useTranslation } from 'react-i18next';

const fallbackImg = '/default-portrait.png'; // Place a default portrait image in public/

const FamousPersonCard: React.FC<{ person: FamousPerson }> = ({ person }) => {
    const { t } = useTranslation();
    return (
        <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', boxShadow: 3 }}>
            <CardMedia
                component="img"
                height="200"
                image={person.image_url || fallbackImg}
                alt={person.name}
                sx={{
                    objectFit: 'contain',
                    objectPosition: 'center',
                    backgroundColor: '#232323',
                    width: '100%',
                    borderBottom: '1px solid #222',
                    backgroundImage: 'url(/Honeycomb_texture.svg)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: 'cover',
                    backgroundBlendMode: 'multiply',
                    opacity: 1,
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'url(/Honeycomb_texture.svg)',
                        backgroundRepeat: 'repeat',
                        backgroundSize: 'cover',
                        opacity: 0.18,
                        pointerEvents: 'none',
                    },
                }}
                onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2, pb: '16px !important', minHeight: 0 }}>
                <Typography variant="h6" component="div" gutterBottom sx={{ mb: 1 }}>
                    {person.name}
                </Typography>
                {person.category && (
                    <Box sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="primary" sx={{ background: '#232323', px: 1.2, py: 0.3, borderRadius: 1 }}>
                            {person.category}
                        </Typography>
                    </Box>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
                    {person.bio}
                </Typography>
                <Button
                    component={Link}
                    to={`/famous/${person.slug}`}
                    variant="contained"
                    color="primary"
                    sx={{ mt: 1, fontWeight: 600, alignSelf: 'stretch' }}
                    fullWidth
                >
                    {t('famous.viewChart')}
                </Button>
            </CardContent>
        </Card>
    );
};

export default FamousPersonCard; 