import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import Notifications from '../components/Notifications.jsx'; 

import './Navbar.css'; 

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sideRef = useRef(null)

  useEffect(()=>{
    const handleOutsideClick = (event) =>{
      if (sideRef.current &&
         !sideRef.current.contains(event.target)&&
          isSidebarOpen){
            setIsSidebarOpen(false)

      }
      

    }
    document.addEventListener('mousedown', handleOutsideClick)

    return () => document.removeEventListener('keydown', handleOutsideClick)
  }, [isSidebarOpen])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <>
    {/* Navbar visible in large screen */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="brand">
            College Connect
          </Link>

          {/* Hamburger for mobile */}
          <button className="menu-toggle" onClick={toggleSidebar}>
            ☰
          </button>

          <div className="nav-menu">
            <NavLink to="/" className="nav-link" end>Home</NavLink>
            <NavLink to="/clubs" className="nav-link">Clubs</NavLink>
            {user && <NavLink to="/feed" className="nav-link">Feed</NavLink>}
            {user && <NavLink to="/create-post" className="nav-link">Create Post</NavLink>}
            {user?.role === 'ADMIN' && <NavLink to="/admin" className="nav-link">Admin</NavLink>}
            {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
              <NavLink to="/create-event" className="nav-link">Create Event</NavLink>
            )}
          </div>

          <div className="auth-links">
            {user ? (
              <>
                <Notifications />
                <NavLink to="/profile" className="nav-link">{user.name}</NavLink>
                <button onClick={logout} className="logout-button">Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="nav-link">Login</NavLink>
                <NavLink to="/signup" className="signup-button">Sign Up</NavLink>
              </>
            )}
          </div>
        </div>
      </nav>

      <div ref={sideRef} className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <h1>Ankit Sharma</h1>
        <NavLink to="/" className="nav-link" onClick={toggleSidebar}>Home</NavLink>
        <NavLink to="/clubs" className="nav-link" onClick={toggleSidebar}>Clubs</NavLink>
        {user && <NavLink to="/feed" className="nav-link" onClick={toggleSidebar}>Feed</NavLink>}
        {user && <NavLink to="/create-post" className="nav-link" onClick={toggleSidebar}>Create Post</NavLink>}
        {user?.role === 'ADMIN' && <NavLink to="/admin" className="nav-link" onClick={toggleSidebar}>Admin</NavLink>}
        {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
          <NavLink to="/create-event" className="nav-link" onClick={toggleSidebar}>Create Event</NavLink>
        )}

        <div className="sidebar-auth">
          {user ? (
            <>
              <NavLink to="/profile" className="nav-link" onClick={toggleSidebar}>{user.name}</NavLink>
              <button onClick={logout} className="logout-button">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link" onClick={toggleSidebar}>Login</NavLink>
              <NavLink to="/signup" className="signup-button" onClick={toggleSidebar}>Sign Up</NavLink>
            </>
          )}
        </div>
      </div>
    </>
  );
}
