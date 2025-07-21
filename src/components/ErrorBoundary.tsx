import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    shouldThrow: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: undefined, shouldThrow: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, shouldThrow: false };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    // For dev test button
    state = { hasError: false, error: undefined as Error | undefined, shouldThrow: false };

    render() {
        if (this.state.shouldThrow) {
            throw new Error('Test ErrorBoundary');
        }
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '60vh',
                        bgcolor: '#181716',
                        color: 'white',
                        borderRadius: 3,
                        boxShadow: '0 4px 24px 0 rgba(255,152,0,0.10)',
                        p: { xs: 3, sm: 5 },
                        m: 2,
                        textAlign: 'center',
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 2
                    }}>
                        <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: 'linear-gradient(45deg, #ff9800, #ff5722)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                                !
                            </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                            Oops! Something went wrong
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#e0e0e0', mb: 3, maxWidth: 480, mx: 'auto', fontWeight: 500 }}>
                        We encountered an unexpected error. Please try refreshing the page or return to the home page. If the problem persists, contact support.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
                        <Button
                            variant="contained"
                            onClick={this.handleRetry}
                            sx={{
                                background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
                                color: 'white',
                                px: 4,
                                py: 1.5,
                                fontWeight: 600,
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #ff9800 60%, #ff5722 90%)',
                                }
                            }}
                        >
                            Try Again
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => window.location.reload()}
                            sx={{
                                borderColor: '#ff9800',
                                color: '#ff9800',
                                fontWeight: 600,
                                px: 4,
                                py: 1.5,
                                '&:hover': {
                                    borderColor: '#ff5722',
                                    color: '#ff5722',
                                }
                            }}
                        >
                            Refresh Page
                        </Button>
                    </Box>
                    <Button
                        variant="text"
                        href="/"
                        sx={{ color: 'white', textDecoration: 'underline', mt: 1 }}
                    >
                        Go to Home
                    </Button>
                </Box>
            );
        }

        // Remove the dev test button
        return this.props.children;
    }
}

export default ErrorBoundary; 