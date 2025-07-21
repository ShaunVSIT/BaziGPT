// src/pages/TestError.tsx
export default function TestError() {
    if (process.env.NODE_ENV !== 'development') {
        return <div style={{ color: 'white', textAlign: 'center', marginTop: 64 }}>Not Found</div>;
    }
    throw new Error('This is a test error for ErrorBoundary!');
    // Add a fallback return to satisfy TypeScript, though it will never be reached
    return <div />;
} 