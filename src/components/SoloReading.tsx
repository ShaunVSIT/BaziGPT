import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
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
import { getBaziReading, getFollowUpAnswer } from '../services/openai';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { track } from '@vercel/analytics/react';
import ShareIcon from '@mui/icons-material/Share';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';
import ShareCardBase from './ShareCardBase';

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

const SoloReading: React.FC<SoloReadingProps> = ({ onModeSwitch }) => {
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

    const handleDateChange = (newValue: Date | null) => {
        setBirthDate(newValue);
        setError(null);
        if (newValue?.getTime() !== birthDate?.getTime()) {
            setReading(null);
            setSelectedQuestion(null);
            setFollowUpAnswer(null);
            setCachedAnswers({});
        }
    };

    const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = event.target.value;
        setBirthTime(newTime);
        if (newTime !== birthTime) {
            setReading(null);
            setSelectedQuestion(null);
            setFollowUpAnswer(null);
            setCachedAnswers({});
        }
    };

    const handleSubmit = async () => {
        if (!birthDate) {
            setError('Please select a birth date first');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const baziReading = await getBaziReading(birthDate, birthTime || undefined);
            setReading(baziReading);
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
            const answer = await getFollowUpAnswer(birthDate, question);
            setFollowUpAnswer(answer);
            setCachedAnswers(prev => ({
                ...prev,
                [question]: answer
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
    };

    const handleShare = async () => {
        if (!shareCardRef.current) return;

        try {
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
            Share My Reading
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
                    Share Your Bazi Reading
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Share your personalized Bazi reading with friends and family
                        </Typography>
                        <ShareCardBase
                            title="Your Bazi Reading"
                            qrValue={window.location.href}
                        >
                            {/* Four Pillars */}
                            {sections.fourPillars && (
                                <Box sx={{ color: 'white', mb: 2, textAlign: 'left', fontSize: '1rem' }}>
                                    <ReactMarkdown components={markdownComponents}>{sections.fourPillars}</ReactMarkdown>
                                </Box>
                            )}
                            {/* Key Insights (includes Core Self, etc.) */}
                            {sections.keyInsights && (
                                <Box sx={{ color: 'white', mb: 2, textAlign: 'left', fontSize: '1rem' }}>
                                    <ReactMarkdown components={markdownComponents}>{sections.keyInsights}</ReactMarkdown>
                                </Box>
                            )}
                            {/* Shareable Summary */}
                            <Typography variant="body1" sx={{ color: '#ff9800', mb: 2, lineHeight: 1.6, textAlign: 'left', fontWeight: 600 }}>
                                {getShareableSummary()}
                            </Typography>
                        </ShareCardBase>
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
                        Download Image
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
                        Close
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
                    Discover your destiny through AI-powered Bazi readings
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
                            color: 'text.secondary',
                            background: 'transparent',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: '#ff9800',
                            },
                            transition: 'all 0.2s ease-in-out'
                        }}
                    >
                        Compatibility
                    </Button>
                </Box>

                {/* Main Form or Reading Display */}
                {!reading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
                            Enter your birth information
                        </Typography>
                        <Box sx={{ width: '100%', maxWidth: 400 }}>
                            <DatePicker
                                label="Birth Date"
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
                                label="Birth Time (Optional)"
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
                                If not provided, noon (12:00) will be used as a reference point
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
                                    Generating Reading...
                                </Box>
                            ) : (
                                'Generate My Reading'
                            )}
                        </Button>
                        {error && (
                            <Alert severity="error" sx={{ mt: 1, width: '100%' }}>
                                {error}
                            </Alert>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ mt: 4 }}>
                        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h5" color="primary.main" gutterBottom>
                                    Your Bazi Reading
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
                                    <ReactMarkdown>{reading.reading}</ReactMarkdown>
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
                                Ask Follow-up Questions
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Get more specific insights about different aspects of your life:
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                                {[
                                    'What about my career?',
                                    'What about my health?',
                                    'What about my relationships?',
                                    'What about my finances?',
                                    'What about my education?',
                                    'What about my travel opportunities?'
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
                                        <ReactMarkdown>{followUpAnswer}</ReactMarkdown>
                                    </Box>
                                </Paper>
                            )}
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