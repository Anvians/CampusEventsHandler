import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Tag, Users } from 'lucide-react';

// Helper to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function EventCard({ event }) {
  const placeholderImage = `https://placehold.co/600x400/6366f1/white?text=${encodeURIComponent(event.title)}&font=inter`;

  return (
    <div
      style={styles.card}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = styles.card.boxShadow;
      }}
    >
      <Link to={`/event/${event.id}`} style={styles.linkBlock}>
        <img
          src={event.banner_url || placeholderImage}
          alt={`${event.title} banner`}
          style={styles.image}
          onError={(e) => {
            e.target.src = placeholderImage;
          }}
        />
      </Link>

      <div style={styles.content}>
        {/* Category Tag */}
        {event.category && (
          <span style={styles.categoryTag}>
            <Tag style={styles.iconSmall} />
            {event.category}
          </span>
        )}

        <h3 style={styles.title}>
          <Link
            to={`/event/${event.id}`}
            style={styles.titleLink}
            onMouseOver={(e) => (e.target.style.color = '#4F46E5')}
            onMouseOut={(e) => (e.target.style.color = '#1F2937')}
          >
            {event.title}
          </Link>
        </h3>

        {/* Date */}
        <div style={styles.infoRow}>
          <Calendar style={styles.iconMedium} />
          <span style={styles.infoText}>{formatDate(event.event_datetime)}</span>
        </div>

        {/* Venue */}
        <div style={{ ...styles.infoRow, marginBottom: '1rem' }}>
          <MapPin style={styles.iconMedium} />
          <span style={styles.infoText}>{event.venue || 'Online'}</span>
        </div>

        {/* Price & Registration */}
        <div style={styles.footerRow}>
          <span style={styles.price}>
            {event.price === 0 ? 'Free' : `$${event.price}`}
          </span>
          <div style={styles.registrationInfo}>
            <Users style={styles.iconMedium} />
            <span>
              {event._count.registrations} / {event.registration_limit}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div style={styles.cardFooter}>
        <Link
          to={`/event/${event.id}`}
          style={styles.footerLink}
          onMouseOver={(e) => (e.target.style.color = '#3730A3')}
          onMouseOut={(e) => (e.target.style.color = '#4F46E5')}
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  linkBlock: {
    display: 'block',
  },
  image: {
    width: '100%',
    height: '12rem',
    objectFit: 'cover',
  },
  content: {
    padding: '1.25rem',
  },
  categoryTag: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    color: '#4338CA',
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  },
  iconSmall: {
    width: '0.75rem',
    height: '0.75rem',
    marginRight: '0.25rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '0.5rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  titleLink: {
    color: '#1F2937',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    color: '#4B5563',
    marginBottom: '0.5rem',
  },
  iconMedium: {
    width: '1rem',
    height: '1rem',
    marginRight: '0.5rem',
    color: '#6366F1',
  },
  infoText: {
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#4F46E5',
  },
  registrationInfo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    color: '#6B7280',
    gap: '0.25rem',
  },
  cardFooter: {
    backgroundColor: '#F9FAFB',
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid #F3F4F6',
  },
  footerLink: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4F46E5',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
};
