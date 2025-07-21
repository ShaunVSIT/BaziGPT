import React from 'react';
import { FamousPerson } from '../pages/Famous';
import { Link } from 'react-router-dom';

const FamousPeopleGrid: React.FC<{ people: FamousPerson[] }> = ({ people }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {people.map(person => (
            <Link
                to={`/famous/${person.slug}`}
                key={person.id}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
                {person.image_url && (
                    <img
                        src={person.image_url}
                        alt={person.name}
                        className="w-full h-48 object-cover object-center"
                        loading="lazy"
                    />
                )}
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-1">{person.name}</h2>
                    {person.category && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                            {person.category}
                        </span>
                    )}
                    <p className="text-gray-600 text-sm line-clamp-3">{person.bio}</p>
                </div>
            </Link>
        ))}
    </div>
);

export default FamousPeopleGrid; 