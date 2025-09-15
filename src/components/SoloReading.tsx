import React, { useState, useRef, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
// Navigation now handled by Layout component
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Button,
    TextField,
    Collapse,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Fab,
    Zoom,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { track } from '@vercel/analytics/react';
import ShareIcon from '@mui/icons-material/Share';
// Lazy load heavy components
const ReactMarkdown = React.lazy(() => import('react-markdown'));
const ShareCardBase = React.lazy(() => import('./ShareCardBase'));
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface BaziReading {
    reading: string;
    shareableSummary: string;
}

interface SoloReadingProps {
    onModeSwitch: (mode: 'solo' | 'compatibility') => void;
}

// Helper to extract Four Pillars and Core Self from the reading markdown
function extractShareCardSections(readingMarkdown: string) {
    if (!readingMarkdown) return { fourPillars: '', keyInsights: '', coreSelf: '' };
    // Four Pillars: match any heading level, allow whitespace, tolerate extra newlines
    const fourPillarsMatch = readingMarkdown.match(/#+\s*Four Pillars[\s\S]*?(?:\n- .+)+/i);
    let fourPillars = fourPillarsMatch ? fourPillarsMatch[0] : '';

    // Key Insights: match the whole section, including all sub-sections, until the next top-level heading
    const keyInsightsMatch = readingMarkdown.match(/#+\s*Key Insights[\s\S]*?(?=\n#+\s|$)/i);
    let keyInsights = keyInsightsMatch ? keyInsightsMatch[0] : '';

    // Core Self: match any heading level, allow whitespace, tolerate extra newlines
    const coreSelfMatch = readingMarkdown.match(/#+\s*Core Self[\s\S]*?(?=\n#+\s|$)/i);
    let coreSelf = coreSelfMatch ? coreSelfMatch[0] : '';

    // Fallback: if not found, use first 5 lines of reading
    if (!fourPillars) fourPillars = readingMarkdown.split('\n').slice(0, 6).join('\n');
    if (!keyInsights) keyInsights = coreSelf;
    return { fourPillars, keyInsights, coreSelf };
}

// Helper to get a unique key for follow-ups based on birth details
function getFollowupsKey(birthDate: Date | null, birthTime: string) {
    if (!birthDate) return 'bazi-solo-followups'; // Fallback key if no birth date
    const dateStr = birthDate instanceof Date ? birthDate.toISOString().split('T')[0] : new Date(birthDate).toISOString().split('T')[0];
    return `bazi-solo-followups-${dateStr}-${birthTime || 'no-time'}`;
}

// Session storage keys
const SOLO_READING_KEY = 'bazi-solo-reading';
const SOLO_FOLLOWUPS_KEY = 'bazi-solo-followups';

const SoloReading: React.FC<SoloReadingProps> = ({ onModeSwitch }) => {
    const { t, i18n } = useTranslation();
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [birthTime, setBirthTime] = useState<string>('');
    const [reading, setReading] = useState<BaziReading | null>(null);
    const [shareableSummary, setShareableSummary] = useState<string | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
    const [followUpAnswer, setFollowUpAnswer] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [followUpLoading, setFollowUpLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMainReadingExpanded, setIsMainReadingExpanded] = useState(true);
    const [cachedAnswers, setCachedAnswers] = useState<Record<string, string>>({});
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const shareCardRef = useRef<HTMLDivElement>(null);

    // Utility to safely parse a date string to Date object or return null
    function parseDateString(dateStr: string | null | undefined): Date | null {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    }

    // Utility to format a Date object as 'YYYY-MM-DD' in local time
    function formatDateToYMD(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    // On mount, restore birthDate and birthTime first, then reading and follow-ups
    React.useEffect(() => {
        const storedBirth = sessionStorage.getItem('bazi-solo-birth');
        let parsedDate = null;
        let birthTime = '';
        if (storedBirth) {
            const parsed = JSON.parse(storedBirth);
            parsedDate = parseDateString(parsed.birthDate);
            birthTime = parsed.birthTime || '';
            setBirthDate(parsedDate);
            setBirthTime(birthTime);
        }
        // Now restore reading and follow-ups for this birth details
        const storedReading = sessionStorage.getItem(SOLO_READING_KEY);
        if (storedReading) {
            setReading(JSON.parse(storedReading));
        }
        if (parsedDate) {
            const followupsKey = getFollowupsKey(parsedDate, birthTime);
            const storedFollowups = sessionStorage.getItem(followupsKey);
            if (storedFollowups) {
                setCachedAnswers(JSON.parse(storedFollowups));
            }
        }
    }, []);

    // Store reading in sessionStorage when it changes
    React.useEffect(() => {
        if (reading) {
            sessionStorage.setItem(SOLO_READING_KEY, JSON.stringify(reading));
        }
    }, [reading]);
    // When storing birth details in sessionStorage, store as 'YYYY-MM-DD' string
    React.useEffect(() => {
        if (birthDate instanceof Date && !isNaN(birthDate.getTime())) {
            const dateStr = formatDateToYMD(birthDate);
            sessionStorage.setItem('bazi-solo-birth', JSON.stringify({ birthDate: dateStr, birthTime }));
        }
    }, [birthDate, birthTime]);
    // Store follow-ups only if birthDate is valid
    React.useEffect(() => {
        if (birthDate instanceof Date && !isNaN(birthDate.getTime())) {
            const followupsKey = getFollowupsKey(birthDate, birthTime);
            if (Object.keys(cachedAnswers).length > 0) {
                sessionStorage.setItem(followupsKey, JSON.stringify(cachedAnswers));
            } else {
                sessionStorage.removeItem(followupsKey);
            }
        }
    }, [cachedAnswers, birthDate, birthTime]);

    // Clear reading when language changes (if we have birth data)
    React.useEffect(() => {
        if (reading && birthDate && birthTime !== undefined) {
            setReading(null);
            setCachedAnswers({});
            // Also clear from sessionStorage to prevent restoration on remount
            sessionStorage.removeItem(SOLO_READING_KEY);
            const followupsKey = getFollowupsKey(birthDate, birthTime);
            sessionStorage.removeItem(followupsKey);
        }
    }, [i18n.language]); // Only trigger on language change

    const handleDateChange = (newValue: any) => {
        if (newValue instanceof Date && !isNaN(newValue.getTime())) {
            setBirthDate(newValue);
        }
        setError(null);
        // Do NOT auto-clear reading or follow-ups
    };

    const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = event.target.value;
        setBirthTime(newTime);
        // Do NOT auto-clear reading or follow-ups
    };

    const handleSubmit = async () => {
        if (!birthDate) {
            setError('Please select a birth date first');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const dateStr = birthDate instanceof Date ? formatDateToYMD(birthDate) : birthDate;
            const response = await fetch('/api/bazi-reading', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    birthDate: dateStr,
                    birthTime: birthTime || undefined,
                    language: i18n.language
                })
            });
            if (!response.ok) throw new Error('Failed to generate your reading.');
            const baziReading = await response.json();
            setReading(baziReading);
            // Clear and reset follow-ups for this new reading
            setCachedAnswers({});
            // Store birth details
            sessionStorage.setItem('bazi-solo-birth', JSON.stringify({ birthDate: dateStr, birthTime }));
            // Remove old follow-ups for this birth details
            const followupsKey = getFollowupsKey(birthDate, birthTime);
            sessionStorage.removeItem(followupsKey);
            track('reading_generated', {
                hasTime: !!birthTime,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while generating your reading.');
            setReading(null);
            track('reading_error', {
                error: err instanceof Error ? err.message : 'Unknown error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionClick = async (question: string) => {
        if (!birthDate) return;

        setSelectedQuestion(question);
        setError(null);
        setIsMainReadingExpanded(false);

        if (cachedAnswers[question]) {
            setFollowUpAnswer(cachedAnswers[question]);
            track('followup_cached', {
                question,
            });
            return;
        }

        setFollowUpLoading(true);

        try {
            const response = await fetch('/api/bazi-followup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    birthDate,
                    question,
                    language: i18n.language
                })
            });
            if (!response.ok) throw new Error('Failed to generate the answer.');
            const data = await response.json();
            setFollowUpAnswer(data.content);
            setCachedAnswers(prev => ({
                ...prev,
                [question]: data.content
            }));
            track('followup_generated', {
                question,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while generating the answer.');
            setFollowUpAnswer(null);
            track('followup_error', {
                question,
                error: err instanceof Error ? err.message : 'Unknown error',
            });
        } finally {
            setFollowUpLoading(false);
        }
    };

    const handleRestart = () => {
        track('reading_restart');
        setBirthDate(null);
        setBirthTime('');
        setReading(null);
        setShareableSummary(null);
        setSelectedQuestion(null);
        setFollowUpAnswer(null);
        setError(null);
        setIsMainReadingExpanded(true);
        setCachedAnswers({});
        sessionStorage.removeItem(SOLO_READING_KEY);
        sessionStorage.removeItem('bazi-solo-birth');
        // Remove all follow-ups for all possible keys
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith(SOLO_FOLLOWUPS_KEY)) sessionStorage.removeItem(key);
        });
    };

    const handleShare = async () => {
        if (!shareCardRef.current) return;

        try {
            // Dynamically import html2canvas to reduce initial bundle size
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(shareCardRef.current, {
                backgroundColor: '#121212',
                scale: 2,
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'my-bazi-reading.png';
            link.href = image;
            link.click();
            track('reading_shared');
        } catch (err) {
            track('share_error', {
                error: err instanceof Error ? err.message : 'Unknown error',
            });
        }
    };

    const renderShareButton = () => (
        <Button
            variant="contained"
            startIcon={<ShareIcon />}
            onClick={() => setShareDialogOpen(true)}
            sx={{
                mt: 3,
                mb: 2,
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
            {t('soloReading.shareReading')}
        </Button>
    );

    const getShareableSummary = () => {
        return shareableSummary || "A balanced individual with natural leadership qualities, combining wisdom with adaptability.";
    };

    const renderShareDialog = () => {
        const sections = reading ? extractShareCardSections(reading.reading) : { fourPillars: '', keyInsights: '', coreSelf: '' };
        // Custom markdown renderers for headings and bold
        const markdownComponents = {
            h1: (props: any) => <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 700, mt: 2, mb: 1, fontSize: '1.2rem' }} {...props} />, // h1
            h2: (props: any) => <Typography variant="subtitle1" sx={{ color: '#ff9800', fontWeight: 700, mt: 2, mb: 1, fontSize: '1.1rem' }} {...props} />, // h2
            h3: (props: any) => <Typography variant="subtitle2" sx={{ color: '#ff9800', fontWeight: 700, mt: 2, mb: 1, fontSize: '1rem' }} {...props} />, // h3
            strong: (props: any) => <span style={{ color: '#ff9800', fontWeight: 700 }}>{props.children}</span>,
            li: (props: any) => <li style={{ marginBottom: 4 }}>{props.children}</li>,
            p: (props: any) => <Typography variant="body2" sx={{ color: 'white', mb: 1, lineHeight: 1.6 }} {...props} />
        };
        return (
            <Dialog
                open={shareDialogOpen}
                onClose={() => setShareDialogOpen(false)}
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
                    {t('soloReading.shareReading')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {t('soloReading.shareReading')}
                        </Typography>
                        <Suspense fallback={<CircularProgress />}>
                            <ShareCardBase
                                title={t('soloReading.title')}
                                qrValue={window.location.href}
                            >
                                {/* Four Pillars */}
                                {sections.fourPillars && (
                                    <Box sx={{ color: 'white', mb: 2, textAlign: 'left', fontSize: '1rem' }}>
                                        <Suspense fallback={<CircularProgress size={20} />}>
                                            <ReactMarkdown components={markdownComponents}>{sections.fourPillars}</ReactMarkdown>
                                        </Suspense>
                                    </Box>
                                )}
                                {/* Key Insights (includes Core Self, etc.) */}
                                {sections.keyInsights && (
                                    <Box sx={{ color: 'white', mb: 2, textAlign: 'left', fontSize: '1rem' }}>
                                        <Suspense fallback={<CircularProgress size={20} />}>
                                            <ReactMarkdown components={markdownComponents}>{sections.keyInsights}</ReactMarkdown>
                                        </Suspense>
                                    </Box>
                                )}
                                {/* Shareable Summary */}
                                <Typography variant="body1" sx={{ color: '#ff9800', mb: 2, lineHeight: 1.6, textAlign: 'left', fontWeight: 600 }}>
                                    {getShareableSummary()}
                                </Typography>
                            </ShareCardBase>
                        </Suspense>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        onClick={handleShare}
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
                        {t('soloReading.downloadImage')}
                    </Button>
                    <Button
                        onClick={() => setShareDialogOpen(false)}
                        variant="outlined"
                        sx={{
                            borderColor: 'rgba(255, 152, 0, 0.3)',
                            color: '#ff9800',
                            '&:hover': {
                                borderColor: '#ff9800',
                            }
                        }}
                    >
                        {t('common.close')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, sm: 3 } }}>
            <Helmet>
                <title>BaziGPT - Your Personal Bazi Reading</title>
                <meta name="description" content="Get your personalized Bazi reading based on your birth date and time. Discover insights about your personality, career, relationships, and life path." />
                <meta property="og:title" content="BaziGPT - Your Personal Bazi Reading" />
                <meta property="og:description" content="Get your personalized Bazi reading based on your birth date and time." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://bazigpt.com" />
                <meta property="og:image" content="https://bazigpt.com/og-image.svg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="BaziGPT - Your Personal Bazi Reading" />
                <meta name="twitter:description" content="Get your personalized Bazi reading based on your birth date and time." />
                <meta name="twitter:image" content="https://bazigpt.com/og-image.svg" />
            </Helmet>

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
                    {t('soloReading.subtitle')}
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
                        {t('soloReading.title')}
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
                            color: 'text.secondary',
                            background: 'transparent',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: '#ff9800',
                            },
                            transition: 'all 0.2s ease-in-out'
                        }}
                    >
                        {t('compatibility.title')}
                    </Button>
                </Box>

                {/* Main Form or Reading Display */}
                {!reading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, textAlign: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: 400 }}>
                            <DatePicker
                                label={t('soloReading.birthDateLabel')}
                                value={birthDate}
                                onChange={handleDateChange}
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
                                label={t('soloReading.birthTimeLabel')}
                                type="time"
                                value={birthTime}
                                onChange={handleTimeChange}
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
                                {t('soloReading.birthTimeTip')}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={!birthDate || loading}
                            sx={{
                                mt: 1,
                                width: { xs: '100%', sm: 'auto' }
                            }}
                        >
                            {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                                    {t('soloReading.loadingReading')}
                                </Box>
                            ) : (
                                t('soloReading.getReading')
                            )}
                        </Button>
                        {error && (
                            <Alert severity="error" sx={{ mt: 1, width: '100%' }}>
                                {t('soloReading.errorReading')}
                            </Alert>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ mt: 4 }}>
                        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h5" color="primary.main" gutterBottom>
                                    {t('soloReading.title')}
                                </Typography>
                                <IconButton
                                    onClick={() => setIsMainReadingExpanded(!isMainReadingExpanded)}
                                    sx={{ color: 'primary.main' }}
                                >
                                    <ExpandMoreIcon />
                                </IconButton>
                            </Box>

                            <Collapse in={isMainReadingExpanded}>
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
                                    <Suspense fallback={<CircularProgress size={20} />}>
                                        <ReactMarkdown>{reading.reading}</ReactMarkdown>
                                    </Suspense>
                                </Box>
                            </Collapse>
                        </Paper>

                        {reading && (
                            <Box sx={{ mb: 2, textAlign: 'center' }}>
                                <Typography variant="subtitle1" color="text.secondary">
                                    Birth: {birthDate ? new Date(birthDate).toLocaleDateString() : ''}
                                    {birthTime && ` at ${birthTime}`}
                                </Typography>
                            </Box>
                        )}

                        {/* Follow-up Questions */}
                        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                            <Typography variant="h6" color="primary.main" gutterBottom>
                                {t('soloReading.followUpTitle')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {t('soloReading.followUpSubtitle')}
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                                {[
                                    t('soloReading.followUpCareer'),
                                    t('soloReading.followUpHealth'),
                                    t('soloReading.followUpRelationships'),
                                    t('soloReading.followUpFinances'),
                                    t('soloReading.followUpEducation'),
                                    t('soloReading.followUpTravel')
                                ].map((question) => (
                                    <Button
                                        key={question}
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleQuestionClick(question)}
                                        disabled={followUpLoading}
                                        sx={{
                                            borderColor: selectedQuestion === question ? 'primary.main' : 'rgba(255, 152, 0, 0.3)',
                                            color: selectedQuestion === question ? 'primary.main' : 'text.secondary',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                color: 'primary.main',
                                            }
                                        }}
                                        endIcon={cachedAnswers[question] ? <CheckCircleIcon color="success" fontSize="small" /> : null}
                                    >
                                        {question}
                                    </Button>
                                ))}
                            </Box>

                            {/* Follow-up Answer Display */}
                            {followUpLoading && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            )}

                            <Collapse in={!!followUpAnswer} unmountOnExit={false}>
                                {followUpAnswer && (
                                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'rgba(255, 152, 0, 0.05)' }}>
                                        <Typography variant="h6" color="primary.main" gutterBottom>
                                            {selectedQuestion}
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
                                            <Suspense fallback={<CircularProgress size={20} />}>
                                                <ReactMarkdown>{followUpAnswer}</ReactMarkdown>
                                            </Suspense>
                                        </Box>
                                    </Paper>
                                )}
                            </Collapse>
                        </Paper>

                        {/* Share Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            {renderShareButton()}
                        </Box>

                        {/* Restart Button */}
                        {reading && (
                            <Box sx={{ textAlign: 'center', mt: 3 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon />}
                                    onClick={handleRestart}
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
                        )}
                    </Box>
                )}

                {/* Share Dialog */}
                {renderShareDialog()}

                {/* Floating Action Button for Share */}
                {reading && (
                    <Zoom in={true}>
                        <Fab
                            color="primary"
                            aria-label="share"
                            onClick={() => setShareDialogOpen(true)}
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

export default SoloReading; 