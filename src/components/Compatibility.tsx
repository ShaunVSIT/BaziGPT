import { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getCompatibilityReading } from '../services/openai';
import { track } from '@vercel/analytics/react';

interface CompatibilityReading {
    reading: string;
    shareableSummary: string;
}

export default function Compatibility() {
    const [person1BirthDate, setPerson1BirthDate] = useState<Date | null>(null);
    const [person1BirthTime, setPerson1BirthTime] = useState<string>('');
    const [person2BirthDate, setPerson2BirthDate] = useState<Date | null>(null);
    const [person2BirthTime, setPerson2BirthTime] = useState<string>('');
    const [reading, setReading] = useState<CompatibilityReading | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handlePerson1DateChange = (newValue: Date | null) => {
        setPerson1BirthDate(newValue);
        setError(null);
        setReading(null);
    };

    const handlePerson1TimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPerson1BirthTime(event.target.value);
    };

    const handlePerson2DateChange = (newValue: Date | null) => {
        setPerson2BirthDate(newValue);
        setError(null);
        setReading(null);
    };

    const handlePerson2TimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPerson2BirthTime(event.target.value);
    };

    const handleSubmit = async () => {
        if (!person1BirthDate || !person2BirthDate) {
            setError('Please select birth dates for both people');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const compatibilityReading = await getCompatibilityReading(
                person1BirthDate,
                person1BirthTime || undefined,
                person2BirthDate,
                person2BirthTime || undefined
            );
            setReading(compatibilityReading);

            // Track successful compatibility reading
            track('compatibility_generated', {
                hasPerson1Time: !!person1BirthTime,
                hasPerson2Time: !!person2BirthTime,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while generating the compatibility reading.');
            setReading(null);
            // Track errors
            track('compatibility_error', {
                error: err instanceof Error ? err.message : 'Unknown error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRestart = () => {
        // Track when users start over
        track('compatibility_restart');
        setPerson1BirthDate(null);
        setPerson1BirthTime('');
        setPerson2BirthDate(null);
        setPerson2BirthTime('');
        setReading(null);
        setError(null);
    };



    const handleCopyToClipboard = async () => {
        if (!reading) return;

        try {
            await navigator.clipboard.writeText(reading.reading);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

            // Track copy action
            track('compatibility_copied');
        } catch (err) {
            // Track copy errors
            track('copy_error', {
                error: err instanceof Error ? err.message : 'Unknown error',
            });
        }
    };

    const handleShare = () => {
        setShareDialogOpen(true);
        // Track share action
        track('compatibility_shared');
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#ff9800' }}>
                        Relationship Compatibility
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                        Discover the compatibility between two people using Chinese Bazi astrology
                    </Typography>
                    <Button
                        component="a"
                        href="/"
                        variant="outlined"
                        sx={{
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                                borderColor: 'primary.dark',
                                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            }
                        }}
                    >
                        ← Back to BaziGPT
                    </Button>
                </Box>

                <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                        Enter Birth Information
                    </Typography>

                    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                        {/* Person 1 */}
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ color: '#ff9800' }}>
                                Person 1
                            </Typography>
                            <DatePicker
                                label="Birth Date"
                                value={person1BirthDate}
                                onChange={handlePerson1DateChange}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        margin: 'normal',
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Birth Time (optional)"
                                type="time"
                                value={person1BirthTime}
                                onChange={handlePerson1TimeChange}
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>

                        {/* Person 2 */}
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ color: '#ff9800' }}>
                                Person 2
                            </Typography>
                            <DatePicker
                                label="Birth Date"
                                value={person2BirthDate}
                                onChange={handlePerson2DateChange}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        margin: 'normal',
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Birth Time (optional)"
                                type="time"
                                value={person2BirthTime}
                                onChange={handlePerson2TimeChange}
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading || !person1BirthDate || !person2BirthDate}
                            sx={{
                                py: 1.5,
                                px: 4,
                                fontSize: '1.1rem',
                                background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
                                boxShadow: '0 3px 5px 2px rgba(255, 152, 0, .3)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #ff9800 60%, #ff5722 90%)',
                                    transform: 'translateY(-2px)',
                                    transition: 'transform 0.2s'
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Generate Compatibility Reading'}
                        </Button>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mt: 3 }}>
                            {error}
                        </Alert>
                    )}
                </Paper>

                {/* Results Section */}
                {reading && (
                    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" sx={{ color: '#ff9800' }}>
                                Compatibility Analysis
                            </Typography>
                            <Box>
                                <IconButton
                                    onClick={handleCopyToClipboard}
                                    color={copied ? 'success' : 'primary'}
                                    title="Copy to clipboard"
                                >
                                    <ContentCopyIcon />
                                </IconButton>
                                <IconButton
                                    onClick={handleShare}
                                    color="primary"
                                    title="Share result"
                                >
                                    <ShareIcon />
                                </IconButton>
                            </Box>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                                {reading.reading}
                            </Typography>
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="outlined"
                                onClick={handleRestart}
                                sx={{ mr: 2 }}
                            >
                                Start New Analysis
                            </Button>
                        </Box>
                    </Paper>
                )}

                {/* Share Dialog */}
                <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Share Compatibility Result</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {reading?.shareableSummary || "Compatibility analysis completed."}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Share this compatibility reading with others to discuss your relationship dynamics.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
                        <Button
                            onClick={() => {
                                handleCopyToClipboard();
                                setShareDialogOpen(false);
                            }}
                            variant="contained"
                        >
                            Copy Summary
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </LocalizationProvider>
    );
} 