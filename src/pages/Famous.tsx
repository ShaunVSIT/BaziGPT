import React, { useEffect, useState, useRef } from 'react';
import FamousPeopleGrid from '../components/FamousPeopleGrid.tsx';
import { Box, Typography, Button, CircularProgress, TextField, InputAdornment, SvgIcon, Paper, Fade } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

// Improved, optically centered X (Twitter) icon
function XIcon(props: any) {
    return (
        <SvgIcon {...props} viewBox="0 0 32 32" sx={{ fontSize: 24 }}>
            <path
                d="M25.5 4h4.1L19.7 15.2 30 28h-8.2l-6.4-8.1L8.2 28H4l10.8-12.6L2 4h8.3l5.7 7.5L25.5 4zm-1.4 21.2h2.3L12.6 6.6h-2.4l13.9 18.6z"
                fill="currentColor"
            />
        </SvgIcon>
    );
}

export type FamousPerson = {
    id: string;
    name: string;
    birth_date: string;
    birth_time?: string;
    bio?: string;
    slug: string;
    image_url?: string;
    category?: string;
    twitter_handle?: string;
    instagram_handle?: string;
    tiktok_handle?: string;
    threads_handle?: string;
    website?: string;
    gpt_summary?: string;
    marketing_blurb?: string;
};

const PAGE_SIZE = 20;

// Themed loading component matching the site's design
const ThemedLoader: React.FC<{ message?: string; subtitle?: string }> = ({
    message = "Loading Famous People",
    subtitle = "Discovering legendary personalities..."
}) => (
    <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
        py: 4
    }}>
        <Fade in={true} timeout={300}>
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
                    {message}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                    {subtitle}
                </Typography>
            </Paper>
        </Fade>
    </Box>
);

const Famous: React.FC = () => {
    const { t } = useTranslation();
    const [people, setPeople] = useState<FamousPerson[]>([]);
    const [category, setCategory] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<FamousPerson[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [allCategories, setAllCategories] = useState<string[]>([]);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Fetch all categories on mount
    useEffect(() => {
        fetch('/api/famous/categories')
            .then(res => res.json())
            .then(data => setAllCategories(data.categories || []));
    }, []);

    // Fetch a page of people (with optional search/category)
    const fetchPeople = async (reset = false, opts: { search?: string; category?: string } = {}) => {
        const activeSearch = opts.search !== undefined ? opts.search : search;
        const activeCategory = opts.category !== undefined ? opts.category : category;
        const pageOffset = reset ? 0 : offset;
        if (reset) setLoading(true);
        else setLoadingMore(true);
        const params = new URLSearchParams();
        params.set('limit', PAGE_SIZE.toString());
        params.set('offset', pageOffset.toString());
        if (activeSearch) params.set('search', activeSearch);
        if (activeCategory) params.set('category', activeCategory);
        const res = await fetch(`/api/famous?${params.toString()}`);
        const data = await res.json();
        if (reset) setPeople(data.data);
        else setPeople(prev => [...prev, ...data.data]);
        setOffset(pageOffset + PAGE_SIZE);
        setHasMore((reset ? data.data.length : people.length + data.data.length) < data.total);
        setLoading(false);
        setLoadingMore(false);
    };

    // Debounced search
    useEffect(() => {
        if (!search) {
            setSearchLoading(false);
            fetchPeople(true, { search: '', category });
            return;
        }
        setSearchLoading(true);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            const params = new URLSearchParams();
            params.set('search', search);
            if (category) params.set('category', category);
            params.set('limit', PAGE_SIZE.toString());
            params.set('offset', '0');
            const res = await fetch(`/api/famous?${params.toString()}`);
            const data = await res.json();
            setSearchResults(data.data);
            setSearchLoading(false);
        }, 300);
        // eslint-disable-next-line
    }, [search, category]);

    // Fetch on category change (if not searching)
    useEffect(() => {
        if (!search) fetchPeople(true, { category });
        // eslint-disable-next-line
    }, [category]);



    // Filter by category (now always from backend)
    const categories = allCategories;
    const filtered = search ? searchResults : people;

    return (
        <>
            <Helmet>
                <title>{t('seo.famous.title')} | BaziGPT</title>
                <meta name="description" content={t('seo.famous.description')} />
                <meta property="og:title" content={`${t('seo.famous.title')} | BaziGPT`} />
                <meta property="og:description" content={t('seo.famous.description')} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://bazigpt.io/famous" />
                <meta property="og:image" content="https://bazigpt.io/og-image.svg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${t('seo.famous.title')} | BaziGPT`} />
                <meta name="twitter:description" content={t('seo.famous.description')} />
                <meta name="twitter:image" content="https://bazigpt.io/og-image.svg" />
                <link rel="canonical" href="https://bazigpt.io/famous" />
            </Helmet>
            <Box maxWidth="lg" mx="auto" px={{ xs: 2, sm: 4 }} py={1}>
                <Typography variant="h4" fontWeight={700} mb={1.5} textAlign="center" sx={{ mt: 2, mb: 1 }}>
                    🌟 {t('famous.title')} 🌟
                </Typography>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        display: 'block',
                        textAlign: 'center',
                        mb: 2,
                        mx: 'auto',
                        maxWidth: 900,
                        fontStyle: 'italic',
                        opacity: 0.8,
                        lineHeight: 1.4,
                        fontSize: { xs: '0.65rem', sm: '0.85rem' },
                        letterSpacing: 0.1,
                    }}
                >
                    {t('famous.disclaimer')}<br />
                    {t('famous.disclaimerContact')}
                </Typography>
                <Box mb={3} display="flex" justifyContent="center">
                    <TextField
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t('famous.searchCelebrity')}
                        variant="outlined"
                        size="small"
                        sx={{ width: 350, background: '#181818', borderRadius: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            'aria-label': 'search famous people',
                        }}
                    />
                </Box>
                {/* Horizontally scrollable tag bar */}
                <Box sx={{ overflowX: 'auto', display: 'flex', pb: 1, mb: 4 }}>
                    <Button
                        variant={!category ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={() => setCategory('')}
                        sx={{ fontWeight: 600, textTransform: 'none', mb: 1, flex: '0 0 auto', minWidth: 90 }}
                    >
                        {t('famous.all')}
                    </Button>
                    {categories.map(cat => (
                        <Button
                            key={cat}
                            variant={category === cat ? 'contained' : 'outlined'}
                            color="primary"
                            onClick={() => setCategory(cat!)}
                            sx={{ fontWeight: 600, textTransform: 'none', mb: 1, flex: '0 0 auto', minWidth: 90 }}
                        >
                            {t(`famous.categories.${cat}`) || cat}
                        </Button>
                    ))}
                </Box>
                {search ? (
                    searchLoading ? (
                        <ThemedLoader
                            message="Searching Famous People"
                            subtitle="Finding matching personalities..."
                        />
                    ) : filtered.length === 0 ? (
                        <Box display="flex" flexDirection="column" alignItems="center" minHeight={200}>
                            <Typography variant="h6" color="text.secondary" mb={2} textAlign="center">
                                {t('famous.noResultsFound')} "{search}".<br />
                                {t('famous.requestReadingMessage')}
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<XIcon />}
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`@bazigpt Please add a Bazi reading for "${search}"! #BaziGPT`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ fontWeight: 600, fontSize: 16 }}
                            >
                                {t('famous.requestReadingButton')} "{search}" {t('famous.requestReadingOnX')}
                            </Button>
                        </Box>
                    ) : (
                        <FamousPeopleGrid people={filtered} />
                    )
                ) : loading ? (
                    <ThemedLoader />
                ) : (
                    <>
                        <FamousPeopleGrid people={filtered} />
                        {hasMore && !category && (
                            <Box display="flex" justifyContent="center" mt={4}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => fetchPeople(false)}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? t('famous.loading') : t('famous.loadMore')}
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </>
    );
};

export default Famous; 