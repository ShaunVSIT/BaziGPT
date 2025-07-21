import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FamousPerson } from './Famous';

const socialLinks = [
    { key: 'twitter_handle', label: 'Twitter', prefix: 'https://twitter.com/' },
    { key: 'instagram_handle', label: 'Instagram', prefix: 'https://instagram.com/' },
    { key: 'tiktok_handle', label: 'TikTok', prefix: 'https://tiktok.com/@' },
    { key: 'threads_handle', label: 'Threads', prefix: 'https://threads.net/@' },
    { key: 'website', label: 'Website', prefix: '' },
];

const FamousPersonPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [person, setPerson] = useState<FamousPerson | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        fetch(`/api/famous/${slug}`)
            .then(res => res.json())
            .then(data => {
                setPerson(data);
                setLoading(false);
                if (data?.name) {
                    document.title = `Bazi Chart of ${data.name} - BaziGPT`;
                    const meta = document.querySelector('meta[name="description"]');
                    if (meta) meta.setAttribute('content', data.bio || '');
                }
            });
    }, [slug]);

    if (loading) return <div className="p-8">Loading…</div>;
    if (!person) return <div className="p-8">Not found.</div>;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex flex-col items-center">
                {person.image_url && (
                    <img src={person.image_url} alt={person.name} className="w-40 h-40 rounded-full object-cover mb-4" />
                )}
                <h1 className="text-3xl font-bold mb-2">{person.name}</h1>
                {person.category && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                        {person.category}
                    </span>
                )}
                <p className="text-gray-600 text-center mb-4">{person.bio}</p>
                <div className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Birthday:</span> {person.birth_date}
                    {person.birth_time && (
                        <span> at {person.birth_time}</span>
                    )}
                </div>
                {person.gpt_summary && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4 w-full">
                        <div className="font-semibold mb-1">Bazi GPT Summary</div>
                        <div>{person.gpt_summary}</div>
                    </div>
                )}
                <div className="flex flex-wrap gap-3 my-4">
                    {socialLinks.map(link => {
                        const value = (person as any)[link.key];
                        if (!value) return null;
                        return (
                            <a
                                key={link.key}
                                href={link.prefix + value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-gray-100 px-3 py-1 rounded hover:bg-blue-100 text-blue-700 text-sm"
                            >
                                {link.label}
                            </a>
                        );
                    })}
                </div>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Compare to my chart</button>
                {person.marketing_blurb && (
                    <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(person.marketing_blurb)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                        Tweet this reading
                    </a>
                )}
            </div>
        </div>
    );
};

export default FamousPersonPage; 