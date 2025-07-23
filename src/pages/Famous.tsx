import React, { useEffect, useState, useRef } from 'react';
import FamousPeopleGrid from '../components/FamousPeopleGrid.tsx';
import { Box, Typography, Button, CircularProgress, TextField, InputAdornment, SvgIcon } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

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

const Famous: React.FC = () => {
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
        <Box maxWidth="lg" mx="auto" px={{ xs: 2, sm: 4 }} py={1}>
            <Typography variant="h4" fontWeight={700} mb={1.5} textAlign="center" sx={{ mt: 2, mb: 1 }}>
                🌟 Famous Bazi Readings 🌟
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
                Disclaimer: All Bazi readings and descriptions on this page are for entertainment purposes only. They are not intended as factual statements or to slander, defame, or misrepresent any individual.<br />
                If you are a public figure and wish to have your information removed or corrected, please contact us.
            </Typography>
            <Box mb={3} display="flex" justifyContent="center">
                <TextField
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search for a celebrity…"
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
                    All
                </Button>
                {categories.map(cat => (
                    <Button
                        key={cat}
                        variant={category === cat ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={() => setCategory(cat!)}
                        sx={{ fontWeight: 600, textTransform: 'none', mb: 1, flex: '0 0 auto', minWidth: 90 }}
                    >
                        {cat}
                    </Button>
                ))}
            </Box>
            {search ? (
                searchLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                        <CircularProgress />
                    </Box>
                ) : filtered.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" minHeight={200}>
                        <Typography variant="h6" color="text.secondary" mb={2} textAlign="center">
                            We couldn't find a match for "{search}".<br />
                            Click the button below to let us know you'd like a reading for your favourite celeb!
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
                            Request a reading for “{search}” on X
                        </Button>
                    </Box>
                ) : (
                    <FamousPeopleGrid people={filtered} />
                )
            ) : loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress />
                </Box>
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
                                {loadingMore ? 'Loading...' : 'Load More'}
                            </Button>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default Famous; 