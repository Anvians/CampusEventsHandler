import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { useAuth } from "../components/context/AuthContext.jsx";
import { io } from "socket.io-client";

// Bell Icon Component
const BellIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);

  // Socket connection and event listeners
  useEffect(() => {
    if (!user) return;

    const socket = io("http://localhost:5001", {
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      socket.emit("join", user.id); 
    });

    socket.on("notification:new", (notification) => {
      console.log("Live notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
    });

    socket.on("connect_error", (err) => {
      console.error("Connection Error:", err.message);
    });

    return () => {
      socket.disconnect();
      console.log("Socket disconnected");
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/api/users/notifications");
      setNotifications(response.data);
    } catch (err) {
      setError("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); 
      return () => clearInterval(interval); 
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification) => {
    setIsOpen(false); 

    if (!notification.is_read) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    }

    // Call API in background to mark as read
    try {
      if (!notification.is_read) {
        // Only call API if it was unread
        await api.put(`/api/users/notifications/${notification.id}/read`);
      }
    } catch (err) {
      console.error("Failed to mark as read", err);
    }

    //Navigate to the notification link
    navigate(notification.link);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div style={styles.container} ref={dropdownRef}>
      <button onClick={handleToggle} style={styles.button}>
        <BellIcon style={{ color: "#4a5568" }} />
        {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <h4 style={styles.dropdownTitle}>Notifications</h4>
          </div>
          <div style={styles.dropdownList}>
            {error && <div style={styles.item}>{error}</div>}
            {notifications.length === 0 && !error && (
              <div style={styles.item}>No new notifications.</div>
            )}
            {notifications.map((noti, index) => {
              const name = noti.originator?.name || "Unknown";
              const avatar =
                noti.originator?.profile_photo ||
                `https://placehold.co/40x40?text=${name[0] || "U"}`;

              return (
                <div
                  key={noti.id || index}
                  onClick={() => handleNotificationClick(noti)}
                  style={styles.item}
                >
                  {!noti.is_read && <div style={styles.unreadDot}></div>}

                  <img src={avatar} alt={name} style={styles.avatar} />

                  <div>
                    <p style={styles.itemText}>{noti.message}</p>
                    <span style={styles.itemDate}>
                      {new Date(
                        noti.created_at || Date.now()
                      ).toLocaleDateString("en-us", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const styles = {
  container: {
    position: "relative",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  button: {
    position: "relative",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "50%",
  },
  badge: {
    position: "absolute",
    top: "0px",
    right: "0px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    fontSize: "11px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #ffffff",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 15px)",
    right: 0,
    width: "380px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    zIndex: 50,
    border: "1px solid #e2e8f0",
  },
  dropdownHeader: {
    padding: "12px 16px",
    borderBottom: "1px solid #f3f4f6",
  },
  dropdownTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a202c",
  },
  dropdownList: {
    maxHeight: "400px",
    overflowY: "auto",
  },
  item: {
    display: "flex",
    gap: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #f3f4f6",
    position: "relative", // For the dot
    transition: "background-color 0.2s ease",
  },
  unreadDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#4c51bf",
    borderRadius: "50%",
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    marginLeft: "12px",
  },
  itemText: {
    margin: 0,
    fontSize: "14px",
    color: "#1a202c",
    lineHeight: 1.5,
  },
  itemDate: {
    fontSize: "12px",
    color: "#718096",
    marginTop: "2px",
  },
};
