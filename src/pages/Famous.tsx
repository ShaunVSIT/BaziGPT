import React, { useEffect, useState } from 'react';
import FamousPeopleGrid from '../components/FamousPeopleGrid';

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
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Famous Bazi Readings</h1>
            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    className={`px-3 py-1 rounded ${!category ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setCategory('')}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`px-3 py-1 rounded ${category === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => setCategory(cat!)}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            {loading ? (
                <div>Loading…</div>
            ) : (
                <FamousPeopleGrid people={filtered} />
            )}
        </div>
    );
};

export default Famous; 