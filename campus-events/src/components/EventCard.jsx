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
    <div className="bg-gray-100 md:m-4 m-10 rounded-xl shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Banner Image */}
      <Link to={`/event/${event.id}`} className="block focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <img
          src={event.banner_url || placeholderImage}
          alt={`${event.title} event banner`}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = placeholderImage;
          }}
        />
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Category Tag */}
        {event.category && (
          <span className="inline-flex items-center text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            <Tag className="w-3 h-3 mr-1" />
            {event.category}
          </span>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 truncate mb-3">
          <Link
            to={`/event/${event.id}`}
            className="hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {event.title}
          </Link>
        </h3>

        {/* Date & Venue */}
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
          {formatDate(event.event_datetime)}
        </div>
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
          {event.venue || 'Online'}
        </div>

        {/* Price & Registration */}
        <div className="flex justify-between items-center">
          <span className="text-indigo-600 font-bold text-lg">
            {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
          </span>
          <div className="flex items-center text-gray-500 text-sm gap-1">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>
              {event._count?.registrations ?? 0} / {event.registration_limit ?? 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
        <Link
          to={`/event/${event.id}`}
          className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
