import React from 'react';
import { FamousPerson } from '../pages/Famous';
import FamousPersonCard from './FamousPersonCard';
import { Grid } from '@mui/material';

const FamousPeopleGrid: React.FC<{ people: FamousPerson[] }> = ({ people }) => (
    <Grid container spacing={3}>
        {people.map(person => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={person.id}>
                <FamousPersonCard person={person} />
            </Grid>
        ))}
    </Grid>
);

export default FamousPeopleGrid; 