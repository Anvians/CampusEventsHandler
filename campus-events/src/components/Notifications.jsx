import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../utils/api.js";
import { useAuth } from "../components/context/AuthContext.jsx";

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
  const dropdownRef = useRef(null);
  
  // Ref to keep track of the socket instance to prevent double-firing in Strict Mode
  const socketRef = useRef(null);

  const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Socket Connection Management
  useEffect(() => {
    if (!user?.id) return;

    if (!socketRef.current) {
      socketRef.current = io(socketUrl, {
        withCredentials: true,
        transports: ["websocket"], 
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        path: "/socket.io/",
      });
    }

    const socket = socketRef.current;

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      // console.log("Socket connected"); // Keep logs clean in production
      socket.emit("join", user.id);
    };

    const onNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("connect", onConnect);
    socket.on("notification:new", onNewNotification);

    return () => {
      socket.off("connect", onConnect);
      socket.off("notification:new", onNewNotification);
      // We generally keep the socket open while the user is logged in, 
      // but if this component unmounts (navigates away), we might want to disconnect 
      // or keep it alive in a global context. For this component-level implementation:
      socket.disconnect(); 
      socketRef.current = null;
    };
  }, [user, socketUrl]);

  // Initial Data Fetch
  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      if (!user?.id) return;
      try {
        const response = await api.get("/api/users/notifications");
        if (isMounted && response.data) {
          setNotifications(response.data);
        }
      } catch (err) {
        // Silent failure in production or log to monitoring service
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();

    // Background polling for redundancy (every 5 minutes)
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  // Dropdown Interaction
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleNotificationClick = async (notification) => {
    setIsOpen(false);

    // Optimistic UI Update
    if (!notification.is_read) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
      
      // API call in background
      api.put(`/api/users/notifications/${notification.id}/read`).catch((err) => {
         console.error("Sync error for read status", err);
      });
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const markAllAsRead = () => {
    // Optimistic update
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

    // In a real app, you likely have a 'mark-all-read' endpoint. 
    // If not, iterate (though inefficient) or add the endpoint to backend.
    // Assuming individual updates for now based on your provided API:
    unreadIds.forEach(id => {
       api.put(`/api/users/notifications/${id}/read`).catch(() => {});
    });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative font-inter" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label="Notifications"
      >
        <BellIcon className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 text-[11px] font-semibold flex items-center justify-center rounded-full bg-red-600 text-white border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h4 className="text-gray-900 font-semibold text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-500 text-sm">
                No new notifications
              </div>
            ) : (
              notifications.map((noti) => {
                const name = noti.originator?.name || "System";
                const avatar = noti.originator?.profile_photo || `https://placehold.co/40x40?text=${name.charAt(0).toUpperCase()}`;
                
                return (
                  <div
                    key={noti.id || noti._id} // Handle potential MongoDB _id usage
                    onClick={() => handleNotificationClick(noti)}
                    className={`flex gap-3 items-start px-4 py-3 cursor-pointer border-b border-gray-100 relative transition-colors ${
                      !noti.is_read ? 'bg-indigo-50/40 hover:bg-indigo-50/80' : 'hover:bg-gray-50'
                    }`}
                  >
                    {!noti.is_read && (
                      <div className="absolute left-1.5 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    )}
                    
                    <img
                      src={avatar}
                      alt={name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-200"
                      onError={(e) => { e.target.src = "https://placehold.co/40x40?text=?"; }}
                    />
                    
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-gray-900 text-sm leading-snug break-words">
                        <span className="font-semibold">{name}</span> {noti.message}
                      </p>
                      <span className="text-gray-400 text-xs mt-1">
                        {new Date(noti.created_at).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}