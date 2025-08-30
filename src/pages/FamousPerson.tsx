import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FamousPerson } from './Famous';
import { Box, Typography, Paper, Button, CircularProgress, Fade } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Helmet } from 'react-helmet-async';

const fallbackImg = '/default-portrait.png';

function formatBirthday(dateStr?: string, timeStr?: string) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    let formatted = date.toLocaleDateString(undefined, options);
    if (timeStr) formatted += ` at ${timeStr}`;
    return formatted;
}

const FamousPersonPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [person, setPerson] = useState<FamousPerson | null>(null);
    const [loading, setLoading] = useState(true);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        if (!slug) return;
        fetch(`/api/famous/${slug}`)
            .then(res => res.json())
            .then(data => {
                setPerson(data);
                setLoading(false);
                if (data?.name) {
                    document.title = `Bazi Chart of ${data.name} - BaziGPT`;
                    const meta = document.querySelector('meta[name="description"]');
                    if (meta) meta.setAttribute('content', data.bio || '');
                }
            });
    }, [slug]);

    if (loading) return (
        <Box sx={{
            width: '100%',
            px: { xs: 0, sm: 2, md: 4 },
            py: { xs: 2, sm: 4 },
            maxWidth: '100vw',
            mx: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh'
        }}>
            <Fade in={loading} timeout={300}>
                <Paper elevation={3} sx={{
                    p: { xs: 4, sm: 6 },
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 87, 34, 0.05) 100%)',
                    border: '1px solid rgba(255, 152, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    maxWidth: 400
                }}>
                    <Box sx={{
                        position: 'relative',
                        mb: 3,
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(45deg, rgba(255, 152, 0, 0.1) 30%, rgba(255, 87, 34, 0.1) 90%)',
                            '@keyframes pulse': {
                                '0%, 100%': {
                                    opacity: 0.4,
                                    transform: 'translate(-50%, -50%) scale(1)',
                                },
                                '50%': {
                                    opacity: 0.8,
                                    transform: 'translate(-50%, -50%) scale(1.1)',
                                }
                            },
                            animation: 'pulse 2s ease-in-out infinite'
                        }
                    }}>
                        <CircularProgress
                            size={60}
                            thickness={4}
                            sx={{
                                color: '#ff9800',
                                '& .MuiCircularProgress-circle': {
                                    strokeLinecap: 'round',
                                }
                            }}
                        />
                    </Box>
                    <Typography variant="h6" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>
                        Loading Bazi Reading
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                        Analyzing the stars and elements...
                    </Typography>
                </Paper>
            </Fade>
        </Box>
    );
    if (!person) return <Box p={6}><Typography>Not found.</Typography></Box>;

    // Prefer 'reading' or 'bazi_reading' field for reading, fallback to gpt_summary
    const readingText = (person as any).reading || (person as any).bazi_reading || person.gpt_summary;

    return (
        <>
            <Helmet>
                <title>{person?.name ? `Bazi Chart of ${person.name} - BaziGPT` : 'Famous Person Bazi Chart - BaziGPT'}</title>
                <meta name="description" content={person?.bio ? person.bio.slice(0, 160) : 'Explore the BaZi chart and Chinese astrology reading for this famous person on BaziGPT.'} />
                <meta property="og:title" content={person?.name ? `Bazi Chart of ${person.name} - BaziGPT` : 'Famous Person Bazi Chart - BaziGPT'} />
                <meta property="og:description" content={person?.bio ? person.bio.slice(0, 160) : 'Explore the BaZi chart and Chinese astrology reading for this famous person on BaziGPT.'} />
                <meta property="og:type" content="profile" />
                <meta property="og:url" content={`https://bazigpt.io/famous/${person?.slug || ''}`} />
                <meta property="og:image" content={person?.image_url ? person.image_url : 'https://bazigpt.io/default-portrait.png'} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={person?.name ? `Bazi Chart of ${person.name} - BaziGPT` : 'Famous Person Bazi Chart - BaziGPT'} />
                <meta name="twitter:description" content={person?.bio ? person.bio.slice(0, 160) : 'Explore the BaZi chart and Chinese astrology reading for this famous person on BaziGPT.'} />
                <meta name="twitter:image" content={person?.image_url ? person.image_url : 'https://bazigpt.io/default-portrait.png'} />
                <link rel="canonical" href={`https://bazigpt.io/famous/${person?.slug || ''}`} />
            </Helmet>
            <Box sx={{ width: '100%', px: { xs: 0, sm: 2, md: 4 }, py: { xs: 2, sm: 4 }, maxWidth: '100vw', mx: 'auto' }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/famous')}
                    sx={{ mb: 2, fontWeight: 600, ml: { xs: 1, sm: 0 } }}
                    color="primary"
                >
                    Back to Famous People
                </Button>
                <Paper elevation={3} sx={{
                    width: '100%',
                    maxWidth: '100vw',
                    p: { xs: 2, sm: 4, md: 6 },
                    borderRadius: { xs: 0, sm: 3 },
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 87, 34, 0.05) 100%)',
                    border: '1px solid rgba(255, 152, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                }}>
                    <Box
                        component="img"
                        src={imgError ? fallbackImg : person.image_url || fallbackImg}
                        alt={person.name}
                        sx={{
                            width: 180,
                            height: 180,
                            objectFit: 'cover',
                            borderRadius: 2,
                            mb: 3,
                            background: '#232323',
                            border: '2px solid #222',
                        }}
                        onError={() => setImgError(true)}
                    />
                    <Typography variant="h3" fontWeight={700} mb={1.5} align="center" color="primary.main">
                        {person.name}
                    </Typography>
                    {person.category && (
                        <Box mb={2}>
                            <Typography variant="subtitle2" sx={{
                                display: 'inline-block',
                                bgcolor: '#ff9800',
                                color: '#232323',
                                px: 2,
                                py: 0.5,
                                borderRadius: 2,
                                fontWeight: 700,
                                textTransform: 'capitalize',
                                fontSize: 16
                            }}>{person.category}</Typography>
                        </Box>
                    )}
                    <Typography variant="body1" color="text.secondary" align="center" mb={2}>
                        {person.bio}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" mb={3}>
                        <span style={{ fontWeight: 600 }}>Birthday:</span> {formatBirthday(person.birth_date, person.birth_time)}
                    </Typography>
                    {readingText && (
                        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3, width: '100%', maxWidth: 800 }}>
                            <Typography variant="h5" color="primary.main" gutterBottom>
                                Bazi Reading
                            </Typography>
                            <Box sx={{ color: 'text.primary', lineHeight: 1.6, fontSize: 18 }}>
                                {(readingText || '')
                                    .split(/\n\s*\n|(?<=\.)\s+(?=[A-Z])/g)
                                    .map((para: string, idx: number) => (
                                        <Box component="p" key={idx} sx={{ mb: 2, mt: 0 }}>
                                            {para.trim()}
                                        </Box>
                                    ))}
                            </Box>
                        </Paper>
                    )}
                    {person.marketing_blurb && (
                        <Button
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${person.marketing_blurb}\n\nReading by @bazigpt\nbazigpt.io`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outlined"
                            color="primary"
                            sx={{ mt: 2, fontWeight: 600, fontSize: 18, py: 1.5, width: '100%', maxWidth: 400 }}
                            fullWidth
                        >
                            Tweet this reading
                        </Button>
                    )}
                </Paper>
            </Box>
        </>
    );
};

export default FamousPersonPage; 