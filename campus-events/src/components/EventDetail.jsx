import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "./context/AuthContext.jsx";
import Spinner from "../components/common/Spinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";
import { Calendar, MapPin, DollarSign, Info, Users, CheckCircle, Trophy } from "lucide-react";

// Helper to format date
const formatDateTime = (dateString) =>
  new Date(dateString).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/api/events/${id}`);
        setEvent(response.data);

        // Check if the current user is already registered
        const alreadyRegistered = response.data.registrations.some(
          (reg) => reg.individual_user_id === user.id
        );
        setIsRegistered(alreadyRegistered);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id, user.id]);

  const handleRegister = async () => {
    setIsRegistering(true);
    setRegistrationError("");
    try {
      await api.post(`/api/events/${id}/register-individual`);
      setIsRegistered(true);
    } catch (err) {
      setRegistrationError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  const renderRegistrationButton = () => {
    if (!user || user.role !== "STUDENT") return null;

    if (isRegistered) {
      return (
        <div className="flex items-center justify-center w-full py-3 rounded-lg bg-green-100 text-green-800 font-semibold">
          <CheckCircle className="w-5 h-5 mr-2" />
          You are registered!
        </div>
      );
    }

    if (!event) return null;

    if (event.registrations.length >= event.registration_limit) {
      return (
        <button
          className="w-full py-3 rounded-lg bg-gray-200 text-gray-600 font-semibold cursor-not-allowed"
          disabled
        >
          Registrations Full
        </button>
      );
    }

    return (
      <button
        onClick={handleRegister}
        disabled={isRegistering}
        className={`w-full py-3 rounded-lg font-semibold ${
          isRegistering
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        {isRegistering ? "Registering..." : "Register for this Event"}
      </button>
    );
  };

  const renderAdminButtons = () => {
    if (!event) return null;

    const isCreatorOrAdmin = user.id === event.created_by || user.role === "ADMIN";

    if (isCreatorOrAdmin) {
      return (
        <div className="mt-4">
          <button
            className="flex items-center justify-center w-full py-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-800 font-semibold hover:bg-gray-200"
            onClick={() => navigate(`/event/${event.id}/post-results`)}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Post Results
          </button>
        </div>
      );
    }
    return null;
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!event) return <p className="text-center mt-8 text-gray-600">Event not found.</p>;

  const placeholderImage = `https://placehold.co/1200x600/6366f1/white?text=${encodeURIComponent(
    event.title
  )}&font=inter`;

  return (
    <div className="bg-gray-50 md:p-10 p-8 min-h-screen font-inter py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <img
            src={event.banner_url || placeholderImage}
            alt={`${event.title} banner`}
            className="w-full h-80 object-cover"
            onError={(e) => (e.target.src = placeholderImage)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <h1 className="text-4xl font-bold text-cyan-800">{event.title}</h1>

              <div className="">
                <h2 className="text-xl font-semibold text-amber-900 flex items-center mb-2">
                  <Info className="w-5 h-5 mr-2 text-indigo-600" />
                  About this Event
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {event.description || "No description provided."}
                </p>
              </div>

              {event.club && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Hosted By:</h3>
                  <div className="flex items-center">
                    <img
                      src={
                        event.club?.club_logo_url ||
                        `https://placehold.co/100x100/e0e7ff/4338ca?text=${event.club.name.charAt(
                          0
                        )}`
                      }
                      alt={event.club.name}
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                    <div>
                      <Link
                        to={`/club/${event.club.id}`}
                        className="text-lg font-bold text-gray-900 hover:text-indigo-600"
                      >
                        {event.club.name}
                      </Link>
                      {event.creator && (
                        <p className="text-sm text-gray-500">
                          Organized by {event.creator.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="flex items-center text-indigo-600 text-lg font-bold">
                  <DollarSign className="w-5 h-5 mr-2" />
                  {event.price === 0 ? "Free Event" : `$${event.price}`}
                </div>

                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Calendar className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-700">Date & Time</h4>
                      <p className="text-gray-500 text-sm">{formatDateTime(event.event_datetime)}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <MapPin className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-700">Location</h4>
                      <p className="text-gray-500 text-sm">{event.venue || "Online"}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-700">Registrations</h4>
                      <p className="text-gray-500 text-sm">
                        {event._count.registrations} / {event.registration_limit}
                      </p>
                    </div>
                  </li>
                </ul>

                {registrationError && <ErrorMessage message={registrationError} />}

                <div className="mt-6 space-y-2">
                  {renderRegistrationButton()}
                  {renderAdminButtons()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
