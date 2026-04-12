import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import Notifications from '../components/Notifications.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sideRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (sideRef.current && !sideRef.current.contains(event.target) && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSidebarOpen]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navLinkClasses = "px-3 py-2 rounded-full text-sm font-semibold text-slate-300 transition hover:text-white hover:bg-slate-800/70";
  const activeNavLinkClasses = "px-3 py-2 rounded-full text-sm font-semibold text-cyan-300 bg-slate-800/80 shadow-[0_0_25px_rgba(56,189,248,0.18)]";

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-700/40 bg-slate-950/90 backdrop-blur-xl shadow-[0_15px_45px_-25px_rgba(15,23,42,0.9)]">
        <div className="max-w-7xl w-full mx-auto flex h-16 items-center justify-between px-6 md:px-8">
          <Link to="/" className="flex items-center gap-3 text-base font-semibold tracking-tight text-slate-100">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.15)]">CC</span>
            <span className="text-lg font-bold text-slate-100">College <span className="text-cyan-300">Connect</span></span>
          </Link>

          {/* Hamburger for mobile */}
          <button
            className="md:hidden text-2xl text-slate-200 focus:outline-none"
            onClick={toggleSidebar}
          >
            ☰
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            <NavLink to="/" end className={({ isActive }) => isActive ? activeNavLinkClasses : navLinkClasses}>
              Home
            </NavLink>
            <NavLink to="/clubs" className={({ isActive }) => isActive ? activeNavLinkClasses : navLinkClasses}>
              Clubs
            </NavLink>
            {user && (
              <>
                <NavLink to="/feed" className={({ isActive }) => isActive ? activeNavLinkClasses : navLinkClasses}>
                  Feed
                </NavLink>
                <NavLink to="/create-post" className={({ isActive }) => isActive ? activeNavLinkClasses : navLinkClasses}>
                  Create Post
                </NavLink>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={({ isActive }) => isActive ? activeNavLinkClasses : navLinkClasses}>
                Admin
              </NavLink>
            )}
            {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
              <NavLink to="/create-event" className={({ isActive }) => isActive ? activeNavLinkClasses : navLinkClasses}>
                Create Event
              </NavLink>
            )}
            <NavLink to="/announcement" className={({ isActive }) => isActive ? activeNavLinkClasses : navLinkClasses}>
              Announcement
            </NavLink>
          </div>

          {/* Auth Links */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Notifications />
                <NavLink to="/profile" className="px-3 py-2 rounded-full text-sm font-semibold text-slate-200 hover:bg-slate-800/70">
                  {user.name}
                </NavLink>
                <button
                  onClick={logout}
                  className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="px-3 py-2 rounded-full text-sm font-semibold text-slate-200 hover:bg-slate-800/70">
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        ref={sideRef}
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 p-5 flex flex-col gap-4 shadow-lg z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:hidden`}
      >
        <h1 className='text-2xl font-bold'>College Connect</h1>
        {/* <button
          onClick={toggleSidebar}
          className="self-end text-2xl focus:outline-none"
        >
          ×
        </button> */}
        {user ? (
          <NavLink to="/profile" className="block" onClick={toggleSidebar}>
            <div className='flex gap-3 items-center bg-indigo-50 rounded-2xl p-3'>
              <img
                src={user.profile_photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'}
                alt={user.name}
                className='rounded-full h-14 w-14 object-cover border-2 border-indigo-300'
              />
              <div>
                <h2 className='font-semibold text-slate-900'>{user.name || 'Campus Member'}</h2>
                <p className='text-xs text-slate-500'>{user.role || 'Student'}</p>
              </div>
            </div>
          </NavLink>
        ) : null}
        

        <NavLink to="/" className={navLinkClasses} onClick={toggleSidebar}>
          Home
        </NavLink>
        <NavLink to="/clubs" className={navLinkClasses} onClick={toggleSidebar}>
          Clubs
        </NavLink>
        {user && (
          <>
            <NavLink to="/feed" className={navLinkClasses} onClick={toggleSidebar}>
              Feed
            </NavLink>
            <NavLink to="/create-post" className={navLinkClasses} onClick={toggleSidebar}>
              Create Post
            </NavLink>
          </>
        )}
        {user?.role === 'ADMIN' && (
          <NavLink to="/admin" className={navLinkClasses} onClick={toggleSidebar}>
            Admin
          </NavLink>
        )}
        {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
          <NavLink to="/create-event" className={navLinkClasses} onClick={toggleSidebar}>
            Create Event
          </NavLink>
        )}

        <div className="mt-4 flex flex-col gap-2">
          {user ? (
            <>
              
              <button
                onClick={logout}
                className="px-3 py-2 rounded-md text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClasses} onClick={toggleSidebar}>
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                onClick={toggleSidebar}
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </>
  );
}
