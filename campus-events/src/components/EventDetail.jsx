import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; 
import api from "../utils/api";
import { useAuth } from "./context/AuthContext.jsx";
import Spinner from "../components/common/Spinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";
import {
  Calendar,
  MapPin,
  DollarSign,
  Info,
  Users,
  CheckCircle,
  Trophy,
} from "lucide-react"; 

// Helper to format date
const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

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

    if (id) {
      fetchEvent();
    }
  }, [id, user.id]);

  const handleRegister = async () => {
    setIsRegistering(true);
    setRegistrationError("");
    try {
      await api.post(`/api/events/${id}/register-individual`);
      setIsRegistered(true);
    } catch (err) {
      setRegistrationError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const renderRegistrationButton = () => {
    if (!user || user.role !== "STUDENT") {
      return null;
    }

    if (isRegistered) {
      return (
        <div style={{ ...styles.regButtonBase, ...styles.regButtonSuccess }}>
          <CheckCircle
            style={{ width: "20px", height: "20px", marginRight: "8px" }}
          />
          You are registered!
        </div>
      );
    }

    if (!event) {
      return null;
    }

    if (event.registrations.length >= event.registration_limit) {
      return (
        <button
          style={{ ...styles.regButtonBase, ...styles.regButtonFull }}
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
        style={
          isRegistering
            ? { ...styles.regButtonBase, ...styles.regButtonDisabled }
            : { ...styles.regButtonBase, ...styles.regButtonPrimary }
        }
      >
        {isRegistering ? "Registering..." : "Register for this Event"}
      </button>
    );
  };

  const renderAdminButtons = () => {
    if (!event) return null;

    // Show button if user is the creator OR an Admin
    const isCreatorOrAdmin =
      user.id === event.created_by || user.role === "ADMIN";

    if (isCreatorOrAdmin) {
      return (
        <div style={{ marginTop: "16px" }}>
          <button
            style={{ ...styles.regButtonBase, ...styles.adminButton }}
            onClick={() => navigate(`/event/${event.id}/post-results`)}
          >
            <Trophy
              style={{ width: "18px", height: "18px", marginRight: "8px" }}
            />
            Post Results
          </button>
        </div>
      );
    }
    return null;
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!event) return <p>Event not found.</p>;

  const placeholderImage = `https://placehold.co/1200x600/6366f1/white?text=${encodeURIComponent(
    event.title
  )}&font=inter`;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <img
            src={event.banner_url || placeholderImage}
            alt={`${event.title} banner`}
            style={styles.banner}
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />

          <div style={styles.contentGrid}>
            {/* Main Content */}
            <div style={styles.mainContent}>
              <h1 style={styles.title}>{event.title}</h1>

              <h2 style={styles.sectionTitle}>
                <Info style={styles.icon} />
                About this Event
              </h2>
              <p style={styles.description}>
                {event.description || "No description provided."}
              </p>

              {event.club && (
                <div style={styles.clubBox}>
                  <h3 style={styles.clubTitle}>Hosted By:</h3>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={
                        event.club?.club_logo_url ||
                        `https://placehold.co/100x100/e0e7ff/4338ca?text=${event.club.name.charAt(
                          0
                        )}`
                      }
                      alt={event.club.name}
                      style={styles.clubLogo}
                    />
                    <div>
                      <Link
                        to={`/club/${event.club.id}`}
                        style={styles.clubName}
                      >
                        {event.club.name}
                      </Link>
                      {event.creator && (
                        <p style={styles.clubOrganizer}>
                          Organized by {event.creator.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={styles.sidebar}>
              <div style={styles.sidebarBox}>
                <div style={styles.price}>
                  <DollarSign style={styles.icon} />
                  <span>
                    {event.price === 0 ? "Free Event" : `$${event.price}`}
                  </span>
                </div>

                <ul style={styles.infoList}>
                  <li style={styles.infoItem}>
                    <Calendar style={{ ...styles.icon, ...styles.infoIcon }} />
                    <div>
                      <h4 style={styles.infoTitle}>Date & Time</h4>
                      <p style={styles.infoText}>
                        {formatDateTime(event.event_datetime)}
                      </p>
                    </div>
                  </li>
                  <li style={styles.infoItem}>
                    <MapPin style={{ ...styles.icon, ...styles.infoIcon }} />
                    <div>
                      <h4 style={styles.infoTitle}>Location</h4>
                      <p style={styles.infoText}>{event.venue || "Online"}</p>
                    </div>
                  </li>
                  <li style={styles.infoItem}>
                    <Users style={{ ...styles.icon, ...styles.infoIcon }} />
                    <div>
                      <h4 style={styles.infoTitle}>Registrations</h4>
                      <p style={styles.infoText}>
                        {event._count.registrations} /{" "}
                        {event.registration_limit}
                      </p>
                    </div>
                  </li>
                </ul>

                {registrationError && (
                  <ErrorMessage message={registrationError} />
                )}

                <div style={{ marginTop: "24px" }}>
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

// --- STYLES ---
const styles = {
  page: {
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  container: { maxWidth: "1024px", margin: "32px auto", padding: "0 24px" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  banner: { width: "100%", height: "350px", objectFit: "cover" },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px",
    padding: "32px",
  },
  mainContent: {},
  sidebar: {},
  title: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
  },
  icon: { width: "20px", height: "20px", marginRight: "8px", color: "#4c51bf" },
  description: {
    fontSize: "16px",
    color: "#4a5568",
    lineHeight: 1.6,
    marginBottom: "24px",
  },
  clubBox: {
    backgroundColor: "#f9fafb",
    border: "1px solid #f3f4f6",
    padding: "16px",
    borderRadius: "12px",
  },
  clubTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#718096",
    marginBottom: "8px",
  },
  clubLogo: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    objectFit: "cover",
    marginRight: "12px",
  },
  clubName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1a202c",
    textDecoration: "none",
  },
  clubOrganizer: { fontSize: "14px", color: "#718096", margin: 0 },
  sidebarBox: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "24px",
    backgroundColor: "#ffffff",
  },
  price: {
    display: "flex",
    alignItems: "center",
    fontSize: "20px",
    fontWeight: "700",
    color: "#4c51bf",
    marginBottom: "16px",
  },
  infoList: { listStyle: "none", padding: 0, margin: 0, spaceY: "16px" },
  infoItem: { display: "flex", alignItems: "flex-start", marginBottom: "16px" },
  infoIcon: { flexShrink: 0, marginTop: "3px", color: "#718096" },
  infoTitle: { fontWeight: "600", color: "#374151" },
  infoText: { color: "#718096", fontSize: "14px" },
  regButtonBase: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  regButtonPrimary: { backgroundColor: "#4c51bf", color: "#ffffff" },
  regButtonSuccess: { backgroundColor: "#d1fae5", color: "#065f46" },
  regButtonFull: {
    backgroundColor: "#e5e7eb",
    color: "#4b5563",
    cursor: "not-allowed",
  },
  regButtonDisabled: {
    backgroundColor: "#a0aec0",
    color: "#ffffff",
    cursor: "not-allowed",
  },
  adminButton: {
    backgroundColor: "#f3f4f6",
    color: "#1f2937",
    border: "1px solid #d1d5db",
  },
};
