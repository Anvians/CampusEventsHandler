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

  const navLinkClasses = "px-3 py-2 rounded-md text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-800";
  const activeNavLinkClasses = "px-3 py-2 rounded-md text-sm font-semibold text-indigo-600 bg-indigo-50";

  return (
    <>
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 h-16 flex items-center px-8">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gray-900">
            <h1 className='text-2xl font-bold font-logo'>College <span>Connect</span></h1>
          </Link>

          {/* Hamburger for mobile */}
          <button
            className="md:hidden text-2xl focus:outline-none"
            onClick={toggleSidebar}
          >
            ☰
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
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

            <NavLink to="/announcement" className={({isActive})=>isActive ? activeNavLinkClasses: navLinkClasses}>Announcement</NavLink>
          </div>

          {/* Auth Links */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Notifications />
                <NavLink to="/profile" className={navLinkClasses}>
                  {user.name}
                </NavLink>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClasses}>Login</NavLink>
                <NavLink
                  to="/signup"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
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
        {user? (
          <NavLink to="/profile"  onClick={toggleSidebar}>
                
              
        <div className='flex gap-3 bg-gray-200 rounded-2xl p-2'>
          <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1wz0j6iNcsEAAUlxR1zS7jElJ8RnGj-74_w&s'
            alt='profile'
            className='rounded-full h-12 w-12' />
          <div>
            <h1 className='font-bold'>Ankit Sharma </h1>
            <p className='text-xs'>@Organizer</p>
          </div>
        </div>
        </NavLink>
      ): " "}
        

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
