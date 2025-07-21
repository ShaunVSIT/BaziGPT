import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { FamousPerson } from '../pages/Famous';

const fallbackImg = '/default-portrait.png'; // Place a default portrait image in public/

const FamousPersonCard: React.FC<{ person: FamousPerson }> = ({ person }) => (
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
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" component="div" gutterBottom>
                {person.name}
            </Typography>
            {person.category && (
                <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="primary" sx={{ background: '#232323', px: 1.2, py: 0.3, borderRadius: 1 }}>
                        {person.category}
                    </Typography>
                </Box>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                {person.bio}
            </Typography>
            <Button
                component={Link}
                to={`/famous/${person.slug}`}
                variant="contained"
                color="primary"
                sx={{ mt: 'auto', fontWeight: 600 }}
                fullWidth
            >
                View Reading
            </Button>
        </CardContent>
    </Card>
);

export default FamousPersonCard; 