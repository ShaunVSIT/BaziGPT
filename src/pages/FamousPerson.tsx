import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FamousPerson } from './Famous';
import { Box, Typography, Paper, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

    if (loading) return <Box p={6}><Typography>Loading…</Typography></Box>;
    if (!person) return <Box p={6}><Typography>Not found.</Typography></Box>;

    // Prefer 'reading' or 'bazi_reading' field for reading, fallback to gpt_summary
    const readingText = (person as any).reading || (person as any).bazi_reading || person.gpt_summary;

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 2, sm: 3 } }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/famous')}
                sx={{ mb: 2, fontWeight: 600 }}
                color="primary"
            >
                Back to Famous People
            </Button>
            <Paper elevation={3} sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 87, 34, 0.05) 100%)',
                border: '1px solid rgba(255, 152, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
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
                    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                        <Typography variant="h5" color="primary.main" gutterBottom>
                            Bazi Reading
                        </Typography>
                        <Box sx={{ color: 'text.primary', lineHeight: 1.6, fontSize: 18 }}>
                            {readingText}
                        </Box>
                    </Paper>
                )}
                <Button variant="contained" color="primary" sx={{ mt: 2, fontWeight: 600, fontSize: 18, py: 1.5 }} fullWidth>
                    Compare to my chart
                </Button>
            </Paper>
        </Box>
    );
};

export default FamousPersonPage; 