import React from 'react';
import EventCard from './EventCard.jsx';

export default function EventList({ events }) {
  return (
    <div style={styles.grid}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem',

    '@media (min-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)', 
    },
    '@media (min-width: 1024px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },
};
