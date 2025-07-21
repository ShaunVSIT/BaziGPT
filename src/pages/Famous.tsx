import React, { useEffect, useState } from 'react';
import FamousPeopleGrid from '../components/FamousPeopleGrid.tsx';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/material';

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

const Famous: React.FC = () => {
    const [people, setPeople] = useState<FamousPerson[]>([]);
    const [category, setCategory] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/famous')
            .then(res => res.json())
            .then(data => {
                setPeople(data);
                setLoading(false);
            });
    }, []);

    const categories = Array.from(new Set(people.map(p => p.category).filter(Boolean)));
    const filtered = category ? people.filter(p => p.category === category) : people;

    return (
        <Box maxWidth="lg" mx="auto" px={{ xs: 2, sm: 4 }} py={6}>
            <Typography variant="h4" fontWeight={700} mb={3} textAlign="center">
                Famous Bazi Readings
            </Typography>
            <Stack direction="row" spacing={1} mb={4} justifyContent="center" flexWrap="wrap">
                <Button
                    variant={!category ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => setCategory('')}
                    sx={{ fontWeight: 600, textTransform: 'none', mb: 1 }}
                >
                    All
                </Button>
                {categories.map(cat => (
                    <Button
                        key={cat}
                        variant={category === cat ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={() => setCategory(cat!)}
                        sx={{ fontWeight: 600, textTransform: 'none', mb: 1 }}
                    >
                        {cat}
                    </Button>
                ))}
            </Stack>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress />
                </Box>
            ) : (
                <FamousPeopleGrid people={filtered} />
            )}
        </Box>
    );
};

export default Famous; 