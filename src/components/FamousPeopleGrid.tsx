import React from 'react';
import { FamousPerson } from '../pages/Famous';
import FamousPersonCard from './FamousPersonCard';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';

const CARD_HEIGHT = 440; // Increased to prevent button cutoff
const GUTTER_SIZE = 24;

const FamousPeopleGrid: React.FC<{ people: FamousPerson[] }> = ({ people }) => {
    const theme = useTheme();
    // Responsive column count
    const isXl = useMediaQuery(theme.breakpoints.up('xl'));
    const isLg = useMediaQuery(theme.breakpoints.up('lg'));
    const isMd = useMediaQuery(theme.breakpoints.up('md'));
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));

    let columnCount = 1;
    if (isXl) columnCount = 4;
    else if (isLg) columnCount = 3;
    else if (isMd) columnCount = 2;

    const rowCount = Math.ceil(people.length / columnCount);

    const Row = ({ index, style }: ListChildComponentProps) => {
        const items = [];
        for (let col = 0; col < columnCount; col++) {
            const personIdx = index * columnCount + col;
            if (personIdx < people.length) {
                items.push(
                    <Box key={people[personIdx].id} flex={1} minWidth={0} mx={1}>
                        <FamousPersonCard person={people[personIdx]} />
                    </Box>
                );
            } else {
                items.push(<Box key={`empty-${col}`} flex={1} minWidth={0} mx={1} />);
            }
        }
        return (
            <Box style={style} display="flex" width="100%" py={2}>
                {items}
            </Box>
        );
    };

    return (
        <Box width="100%" minHeight={400}>
            <List
                height={Math.min(window.innerHeight * 0.7, rowCount * (CARD_HEIGHT + GUTTER_SIZE))}
                itemCount={rowCount}
                itemSize={CARD_HEIGHT + GUTTER_SIZE}
                width={"100%"}
            >
                {Row}
            </List>
        </Box>
    );
};

export default FamousPeopleGrid; 