import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

  // Socket connection
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

    return () => socket.disconnect();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/api/users/notifications");
      setNotifications(response.data);
    } catch (err) {
      setError("Failed to load notifications");
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleNotificationClick = async (notification) => {
    setIsOpen(false);

    if (!notification.is_read) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    }

    try {
      if (!notification.is_read) {
        await api.put(`/api/users/notifications/${notification.id}/read`);
      }
    } catch (err) {
      console.error("Failed to mark as read", err);
    }

    navigate(notification.link);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative font-inter" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <BellIcon className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 text-[11px] font-semibold flex items-center justify-center rounded-full bg-red-500 text-white border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-4 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <h4 className="text-gray-900 font-semibold text-sm">Notifications</h4>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {error && <div className="px-4 py-3 text-red-500">{error}</div>}
            {notifications.length === 0 && !error && (
              <div className="px-4 py-3 text-gray-500">No new notifications.</div>
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
                  className="flex gap-3 items-start px-4 py-3 cursor-pointer border-b border-gray-100 relative hover:bg-gray-50 transition-colors"
                >
                  {!noti.is_read && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-indigo-600 rounded-full"></div>
                  )}
                  <img
                    src={avatar}
                    alt={name}
                    className="w-10 h-10 rounded-full object-cover ml-3"
                  />
                  <div className="flex flex-col">
                    <p className="text-gray-900 text-sm leading-5">{noti.message}</p>
                    <span className="text-gray-400 text-xs mt-1">
                      {new Date(noti.created_at || Date.now()).toLocaleDateString("en-us", {
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
