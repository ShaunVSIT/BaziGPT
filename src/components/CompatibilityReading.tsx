import React, { useState, useRef } from 'react';
// Navigation now handled by Layout component
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Fab,
    Zoom,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getCompatibilityReading } from '../services/openai';
import RefreshIcon from '@mui/icons-material/Refresh';
import { track } from '@vercel/analytics/react';
import ShareIcon from '@mui/icons-material/Share';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';
import ShareCardBase from './ShareCardBase';

interface CompatibilityReadingData {
    reading: string;
    shareableSummary: string;
}

interface CompatibilityReadingProps {
    onModeSwitch: (mode: 'solo' | 'compatibility') => void;
}

// Helper to extract Elemental Compatibility and Key Insights sections from the reading markdown
function extractCompatShareSections(readingMarkdown: string) {
    if (!readingMarkdown) return { elemental: '', keyInsights: '' };
    const elementalMatch = readingMarkdown.match(/#+\s*Elemental Compatibility[\s\S]*?(?=\n#+\s|$)/i);
    const keyInsightsMatch = readingMarkdown.match(/#+\s*Key Insights[\s\S]*?(?=\n#+\s|$)/i);
    return {
        elemental: elementalMatch ? elementalMatch[0] : '',
        keyInsights: keyInsightsMatch ? keyInsightsMatch[0] : ''
    };
}

// Helper to clean duplicate bullets from markdown
function cleanBullets(markdown: string) {
    return markdown.replace(/^(\s*•\s*)/gm, '');
}

// Session storage keys
const COMPAT_READING_KEY = 'bazi-compat-reading';
const COMPAT_BIRTH_KEY = 'bazi-compat-birth';

const CompatibilityReading: React.FC<CompatibilityReadingProps> = ({ onModeSwitch }) => {
    const [person1BirthDate, setPerson1BirthDate] = useState<Date | null>(null);
    const [person1BirthTime, setPerson1BirthTime] = useState<string>('');
    const [person2BirthDate, setPerson2BirthDate] = useState<Date | null>(null);
    const [person2BirthTime, setPerson2BirthTime] = useState<string>('');
    const [compatibilityReading, setCompatibilityReading] = useState<CompatibilityReadingData | null>(null);
    const [compatibilityLoading, setCompatibilityLoading] = useState(false);
    const [compatibilityError, setCompatibilityError] = useState<string | null>(null);
    const [compatibilityShareDialogOpen, setCompatibilityShareDialogOpen] = useState(false);
    const compatibilityShareCardRef = useRef<HTMLDivElement>(null);

    // On mount, restore birth details and reading from sessionStorage
    React.useEffect(() => {
        // 1. Try to restore Compatibility session
        const storedBirth = sessionStorage.getItem(COMPAT_BIRTH_KEY);
        const storedReading = sessionStorage.getItem(COMPAT_READING_KEY);
        if (storedBirth) {
            const { person1BirthDate: p1d, person1BirthTime: p1t, person2BirthDate: p2d, person2BirthTime: p2t } = JSON.parse(storedBirth);
            if (p1d) setPerson1BirthDate(new Date(p1d));
            if (p1t) setPerson1BirthTime(p1t);
            if (p2d) setPerson2BirthDate(new Date(p2d));
            if (p2t) setPerson2BirthTime(p2t);
        } else {
            // 2. If no Compatibility session, auto-fill person1 from Solo session
            const soloBirth = sessionStorage.getItem('bazi-solo-birth');
            if (soloBirth) {
                const { birthDate, birthTime } = JSON.parse(soloBirth);
                if (birthDate) setPerson1BirthDate(new Date(birthDate));
                if (birthTime) setPerson1BirthTime(birthTime);
            }
        }
        if (storedReading) {
            setCompatibilityReading(JSON.parse(storedReading));
        }
    }, []);

    // Store reading and birth details in sessionStorage when they change
    React.useEffect(() => {
        if (compatibilityReading) {
            sessionStorage.setItem(COMPAT_READING_KEY, JSON.stringify(compatibilityReading));
        }
    }, [compatibilityReading]);
    React.useEffect(() => {
        sessionStorage.setItem(COMPAT_BIRTH_KEY, JSON.stringify({
            person1BirthDate: person1BirthDate instanceof Date && !isNaN(person1BirthDate.getTime()) ? person1BirthDate.toISOString() : null,
            person1BirthTime,
            person2BirthDate: person2BirthDate instanceof Date && !isNaN(person2BirthDate.getTime()) ? person2BirthDate.toISOString() : null,
            person2BirthTime
        }));
    }, [person1BirthDate, person1BirthTime, person2BirthDate, person2BirthTime]);

    const handlePerson1DateChange = (newValue: Date | null) => {
        setPerson1BirthDate(newValue);
        setCompatibilityError(null);
        // Do NOT auto-clear reading
    };

    const handlePerson1TimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = event.target.value;
        setPerson1BirthTime(newTime);
        // Do NOT auto-clear reading
    };

    const handlePerson2DateChange = (newValue: Date | null) => {
        setPerson2BirthDate(newValue);
        setCompatibilityError(null);
        // Do NOT auto-clear reading
    };

    const handlePerson2TimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = event.target.value;
        setPerson2BirthTime(newTime);
        // Do NOT auto-clear reading
    };

    const handleCompatibilitySubmit = async () => {
        if (!person1BirthDate || !person2BirthDate) {
            setCompatibilityError('Please select birth dates for both people');
            return;
        }

        setCompatibilityLoading(true);
        setCompatibilityError(null);

        try {
            const compatibilityReading = await getCompatibilityReading(
                person1BirthDate,
                person1BirthTime || undefined,
                person2BirthDate,
                person2BirthTime || undefined
            );
            setCompatibilityReading(compatibilityReading);

            track('compatibility_generated', {
                hasPerson1Time: !!person1BirthTime,
                hasPerson2Time: !!person2BirthTime,
            });
        } catch (err) {
            setCompatibilityError(err instanceof Error ? err.message : 'An error occurred while generating the compatibility reading.');
            setCompatibilityReading(null);
            track('compatibility_error', {
                error: err instanceof Error ? err.message : 'Unknown error',
            });
        } finally {
            setCompatibilityLoading(false);
        }
    };

    const handleCompatibilityRestart = () => {
        track('compatibility_restart');
        setPerson1BirthDate(null);
        setPerson1BirthTime('');
        setPerson2BirthDate(null);
        setPerson2BirthTime('');
        setCompatibilityReading(null);
        setCompatibilityError(null);
        sessionStorage.removeItem(COMPAT_READING_KEY);
        sessionStorage.removeItem(COMPAT_BIRTH_KEY);
    };

    const handleCompatibilityShareDownload = async () => {
        if (!compatibilityShareCardRef.current) return;

        try {
            const canvas = await html2canvas(compatibilityShareCardRef.current, {
                backgroundColor: '#121212',
                scale: 2,
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'our-compatibility-reading.png';
            link.href = image;
            link.click();
            track('compatibility_shared');
        } catch (err) {
            track('compatibility_share_error', {
                error: err instanceof Error ? err.message : 'Unknown error',
            });
        }
    };

    const renderCompatibilityShareDialog = () => {
        const sections = compatibilityReading ? extractCompatShareSections(compatibilityReading.reading) : { elemental: '', keyInsights: '' };
        return (
            <Dialog
                open={compatibilityShareDialogOpen}
                onClose={() => setCompatibilityShareDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: '#1e1e1e',
                        color: 'white',
                        borderRadius: 3,
                    }
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                    Share Your Compatibility Reading
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Share your compatibility reading with friends and family
                        </Typography>
                        <ShareCardBase
                            title="Our Compatibility Reading"
                            qrValue={window.location.href}
                        >
                            {/* Elemental Compatibility */}
                            {sections.elemental && (
                                <Box sx={{ color: 'white', mb: 2, textAlign: 'center', fontSize: '1rem' }}>
                                    <ReactMarkdown>{cleanBullets(sections.elemental)}</ReactMarkdown>
                                </Box>
                            )}
                            {/* Key Insights */}
                            {sections.keyInsights && (
                                <Box sx={{ color: 'white', mb: 2, textAlign: 'center', fontSize: '1rem' }}>
                                    <ReactMarkdown>{cleanBullets(sections.keyInsights)}</ReactMarkdown>
                                </Box>
                            )}
                        </ShareCardBase>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        onClick={handleCompatibilityShareDownload}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
                            color: 'white',
                            px: 4,
                            py: 1.5,
                            '&:hover': {
                                background: 'linear-gradient(45deg, #ff9800 60%, #ff5722 90%)',
                            }
                        }}
                    >
                        Download Image
                    </Button>
                    <Button
                        onClick={() => setCompatibilityShareDialogOpen(false)}
                        variant="outlined"
                        sx={{
                            borderColor: 'rgba(255, 152, 0, 0.3)',
                            color: '#ff9800',
                            '&:hover': {
                                borderColor: '#ff9800',
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, sm: 3 } }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{
                    color: '#ff9800',
                    fontWeight: 'bold',
                    mb: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                }}>
                    <span style={{ fontSize: '0.9em' }}>🀄</span>
                    BaziGPT
                    <span style={{ fontSize: '0.9em' }}>🀄</span>
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    Discover your compatibility through AI-powered Bazi readings
                </Typography>
                {/* Navigation removed - now handled by Layout component */}
            </Box>

            {/* Reading Section Card */}
            <Paper elevation={3} sx={{
                p: { xs: 2, sm: 3 },
                mb: 2,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 87, 34, 0.05) 100%)',
                border: '1px solid rgba(255, 152, 0, 0.1)'
            }}>
                {/* Mode Toggle */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    bgcolor: 'rgba(255, 152, 0, 0.1)',
                    borderRadius: { xs: 2, sm: 2.5, md: 3 },
                    p: { xs: 0.25, sm: 0.5 },
                    width: 'fit-content',
                    mx: 'auto'
                }}>
                    <Button
                        onClick={() => onModeSwitch('solo')}
                        sx={{
                            borderRadius: { xs: 1.5, sm: 2 },
                            px: { xs: 2, sm: 3 },
                            py: { xs: 0.75, sm: 1 },
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            fontWeight: 500,
                            textTransform: 'none',
                            color: 'text.secondary',
                            background: 'transparent',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: '#ff9800',
                            },
                            transition: 'all 0.2s ease-in-out'
                        }}
                    >
                        Solo Reading
                    </Button>
                    <Button
                        onClick={() => onModeSwitch('compatibility')}
                        sx={{
                            borderRadius: { xs: 1.5, sm: 2 },
                            px: { xs: 2, sm: 3 },
                            py: { xs: 0.75, sm: 1 },
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            fontWeight: 500,
                            textTransform: 'none',
                            color: 'white',
                            background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                            boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #ff9800 20%, #ff5722 100%)',
                                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)',
                            },
                            transition: 'all 0.2s ease-in-out'
                        }}
                    >
                        Compatibility
                    </Button>
                </Box>

                {/* Main Form or Reading Display */}
                {!compatibilityReading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
                            Enter birth information for you and your partner
                        </Typography>
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, width: '100%' }}>
                            {/* You */}
                            <Box>
                                <Typography variant="h6" gutterBottom sx={{ color: '#ff9800' }}>
                                    You
                                </Typography>
                                <DatePicker
                                    label="Birth Date"
                                    value={person1BirthDate || null}
                                    onChange={handlePerson1DateChange}
                                    format="dd-MM-yyyy"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            placeholder: "DD-MM-YYYY",
                                        }
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Birth Time (Optional)"
                                    type="time"
                                    value={person1BirthTime}
                                    onChange={handlePerson1TimeChange}
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        mt: -1,
                                        mb: 1,
                                        textAlign: 'center',
                                        px: { xs: 2, sm: 0 }
                                    }}
                                >
                                    If not provided, noon (12:00) will be used as a reference point
                                </Typography>
                            </Box>
                            {/* Your Partner */}
                            <Box>
                                <Typography variant="h6" gutterBottom sx={{ color: '#ff9800' }}>
                                    Your Partner
                                </Typography>
                                <DatePicker
                                    label="Birth Date"
                                    value={person2BirthDate || null}
                                    onChange={handlePerson2DateChange}
                                    format="dd-MM-yyyy"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            placeholder: "DD-MM-YYYY",
                                        }
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Birth Time (Optional)"
                                    type="time"
                                    value={person2BirthTime}
                                    onChange={handlePerson2TimeChange}
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        mt: -1,
                                        mb: 1,
                                        textAlign: 'center',
                                        px: { xs: 2, sm: 0 }
                                    }}
                                >
                                    If not provided, noon (12:00) will be used as a reference point
                                </Typography>
                            </Box>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={handleCompatibilitySubmit}
                            disabled={!person1BirthDate || !person2BirthDate || compatibilityLoading}
                            sx={{
                                mt: 1,
                                width: { xs: '100%', sm: 'auto' }
                            }}
                        >
                            {compatibilityLoading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                                    Generating Compatibility Reading...
                                </Box>
                            ) : (
                                'Generate Compatibility Reading'
                            )}
                        </Button>
                        {compatibilityError && (
                            <Alert severity="error" sx={{ mt: 1, width: '100%' }}>
                                {compatibilityError}
                            </Alert>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ mt: 4 }}>
                        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                            <Typography variant="h5" color="primary.main" gutterBottom>
                                Your Compatibility Reading
                            </Typography>
                            <Box sx={{
                                '& h1, & h2, & h3, & h4, & h5, & h6': {
                                    color: 'primary.main',
                                    fontWeight: 700,
                                    mt: 2,
                                    mb: 1
                                },
                                '& strong': {
                                    color: 'primary.main',
                                    fontWeight: 600
                                },
                                '& ul, & ol': {
                                    pl: 3,
                                    mb: 2
                                },
                                '& li': {
                                    mb: 0.5
                                },
                                color: 'text.primary',
                                lineHeight: 1.6
                            }}>
                                <ReactMarkdown>{compatibilityReading.reading}</ReactMarkdown>
                            </Box>
                        </Paper>

                        {/* Share Button */}
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Button
                                variant="contained"
                                startIcon={<ShareIcon />}
                                onClick={() => setCompatibilityShareDialogOpen(true)}
                                sx={{
                                    py: 1.5,
                                    px: 4,
                                    fontSize: '1.1rem',
                                    width: { xs: '100%', sm: 'auto' },
                                    background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
                                    boxShadow: '0 3px 5px 2px rgba(255, 152, 0, .3)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #ff9800 60%, #ff5722 90%)',
                                        transform: 'translateY(-2px)',
                                        transition: 'transform 0.2s'
                                    }
                                }}
                            >
                                Share Our Reading
                            </Button>
                        </Box>

                        {/* Restart Button */}
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={handleCompatibilityRestart}
                                sx={{
                                    borderColor: 'rgba(255, 152, 0, 0.3)',
                                    color: '#ff9800',
                                    '&:hover': {
                                        borderColor: '#ff9800',
                                    }
                                }}
                            >
                                Start Over
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* Share Dialog */}
                {renderCompatibilityShareDialog()}

                {/* Floating Action Button for Share */}
                {compatibilityReading && (
                    <Zoom in={true}>
                        <Fab
                            color="primary"
                            aria-label="share"
                            onClick={() => setCompatibilityShareDialogOpen(true)}
                            sx={{
                                position: 'fixed',
                                bottom: 16,
                                right: 16,
                                bgcolor: '#ff9800',
                                '&:hover': {
                                    bgcolor: '#f57c00',
                                }
                            }}
                        >
                            <ShareIcon />
                        </Fab>
                    </Zoom>
                )}
            </Paper>
        </Box>
    );
};

export default CompatibilityReading; 