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
    <div className="futuristic-card md:m-0 rounded-[2rem] hover:shadow-[0_40px_90px_rgba(56,189,248,0.15)] transform hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      <Link to={`/event/${event.id}`} className="block focus:outline-none focus:ring-2 focus:ring-cyan-400">
        <img
          src={event.banner_url || placeholderImage}
          alt={`${event.title} event banner`}
          className="w-full h-56 object-cover"
          onError={(e) => {
            e.target.src = placeholderImage;
          }}
        />
      </Link>

      <div className="p-6 flex-1 flex flex-col justify-between">
        {event.category && (
          <span className="futuristic-badge mb-3 inline-flex items-center text-xs uppercase tracking-[0.25em]">
            <Tag className="w-3 h-3 mr-2 text-cyan-300" />
            {event.category}
          </span>
        )}

        <h3 className="text-xl font-semibold text-slate-100 truncate mb-3">
          <Link
            to={`/event/${event.id}`}
            className="hover:text-cyan-300 focus:outline-none"
          >
            {event.title}
          </Link>
        </h3>

        <div className="space-y-3 text-sm text-slate-400 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-300" />
            {formatDate(event.event_datetime)}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-300" />
            {event.venue || 'Online'}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-cyan-300 font-bold text-lg">
            {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
          </span>
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Users className="w-4 h-4 text-cyan-300" />
            <span>
              {event._count?.registrations ?? 0} / {event.registration_limit ?? 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700/60 bg-slate-950/70 px-6 py-4">
        <Link
          to={`/event/${event.id}`}
          className="inline-flex items-center gap-2 text-cyan-300 font-semibold hover:text-cyan-100"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
