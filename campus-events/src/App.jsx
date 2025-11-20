import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


import Navbar from './components/Navbar.jsx';

import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import Home from "./components/Home.jsx";
import Profile from "./components/Profile.jsx";
import UserProfile from './components/UserProfile.jsx'; 
import PostResults from './components/PostResults.jsx'; 

import EventDetail from "./components/EventDetail.jsx";
import AdminRoute from './components/AdminRoute.jsx';
import ClubList from "./components/ClubList.jsx";
import ClubDetail from "./components/ClubDetail.jsx";
import SocialFeed from "./components/SocialFeed.jsx";
import PostDetail from './components/PostDetail.jsx'; 

import CreatePost from "./components/CreatePost.jsx";
import CreateEvent from "./components/CreateEvent.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import OrganizerRoute from "./components/OrganizerRoute.jsx";
import CreateClub from "./components/CreateClub.jsx";



const MainLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: '1px' }}>
        {children}
      </main>
    </div>
  );
};


export default function App() {
  return (
    <Router>
      <Routes>
        {/* ---------------------------------- */}
        {/* --- PUBLIC ROUTES --- */}
        {/* ---------------------------------- */}
        {/* Accessible by anyone */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ---------------------------------- */}
        {/* --- PROTECTED ROUTES (STUDENT) --- */}
        {/* ---------------------------------- */}
        {/* Must be logged in (any role) */}
        <Route path="/" element={<ProtectedRoute><MainLayout><Home /></MainLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><MainLayout><UserProfile /></MainLayout></ProtectedRoute>} />

      <Route path="/event/:id" element={<ProtectedRoute><MainLayout><EventDetail /></MainLayout></ProtectedRoute>} />
      <Route path="/clubs" element={<ProtectedRoute><MainLayout><ClubList /></MainLayout></ProtectedRoute>} />
      <Route path="/club/:id" element={<ProtectedRoute><MainLayout><ClubDetail /></MainLayout></ProtectedRoute>} />
      <Route path="/feed" element={<ProtectedRoute><MainLayout><SocialFeed /></MainLayout></ProtectedRoute>} />
      <Route path="/create-post" element={<ProtectedRoute><MainLayout><CreatePost /></MainLayout></ProtectedRoute>} />
      <Route path="/post/:id" element={<ProtectedRoute><MainLayout><PostDetail /></MainLayout></ProtectedRoute>} />

        {/* ---------------------------------- */}
        {/* --- PROTECTED ROUTES (ORGANIZER) --- */}
        {/* ---------------------------------- */}
        {/* Must be logged in as ORGANIZER or ADMIN */}
        <Route
        path="/create-event"
        element={
          <OrganizerRoute>
            <MainLayout><CreateEvent /></MainLayout>
          </OrganizerRoute>
        }
      />

      <Route
        path="/event/:id/post-results"
        element={
          <OrganizerRoute>
            <MainLayout><PostResults /></MainLayout>
          </OrganizerRoute>
        }
      />

      <Route
        path="/create-club"
        element={
          <OrganizerRoute>
            <MainLayout><CreateClub /></MainLayout>
          </OrganizerRoute>
        }
      />

        {/* ---------------------------------- */}
        {/* --- PROTECTED ROUTES (ADMIN) --- */}
        {/* ---------------------------------- */}
        {/* Must be logged in as ADMIN */}
        <Route
        path="/admin"
        element={
          <AdminRoute>
            <MainLayout><AdminDashboard /></MainLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/create-club"
        element={
          <AdminRoute>
            <MainLayout><CreateClub /></MainLayout>
          </AdminRoute>
        }
      />

        {/* Catch-all route: Redirect to home if logged in, or login if not */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
