import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from './components/Navbar.jsx';
import Announcement from './components/Announcement.jsx'
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import Home from "./components/Home.jsx";
import Profile from "./components/Profile.jsx";
import UserProfile from './components/UserProfile.jsx'; 
import PostResults from "./components/PostResults.jsx"; 

import EventDetail from "./components/EventDetail.jsx";
import ClubList from "./components/ClubList.jsx";
import ClubDetail from "./components/ClubDetail.jsx";
import SocialFeed from "./components/SocialFeed.jsx";
import PostDetail from './components/PostDetail.jsx'; 

import CreatePost from "./components/CreatePost.jsx";
import CreateEvent from "./components/CreateEvent.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import CreateClub from "./components/CreateClub.jsx";

import RouteGuard from './components/RouteGuard.jsx';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(192,132,252,0.14),transparent_26%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle,_rgba(148,163,184,0.08),transparent_40%)] blur-3xl" />
        <Navbar />
        <main className="relative flex-1 py-10 px-4 md:px-8 lg:px-12">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ---------------------------------- */}
        {/* --- PUBLIC ROUTES --- */}
        {/* Accessible by guests only */}
        {/* ---------------------------------- */}
        <Route 
          path="/login" 
          element={
            <RouteGuard authRequired={false} redirectPath="/">
              <Login />
            </RouteGuard>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <RouteGuard authRequired={false} redirectPath="/">
              <Signup />
            </RouteGuard>
          } 
        />
        <Route
          path="/forgot-password"
          element={
            <RouteGuard authRequired={false} redirectPath="/">
              <ForgotPassword />
            </RouteGuard>
          }
        />
        <Route
          path="/reset-password"
          element={
            <RouteGuard authRequired={false} redirectPath="/">
              <ResetPassword />
            </RouteGuard>
          }
        />

        {/* ---------------------------------- */}
        {/* --- PROTECTED ROUTES (ANY LOGGED-IN USER) --- */}
        {/* ---------------------------------- */}
        <Route 
          path="/" 
          element={
            <RouteGuard>
              <MainLayout><Home /></MainLayout>
            </RouteGuard>
          } 
        />

        <Route
        path="/announcement"
        element={
          <RouteGuard>
            <MainLayout><Announcement/></MainLayout>
          </RouteGuard>
        }
        />
        <Route 
          path="/profile" 
          element={
            <RouteGuard>
              <MainLayout><Profile /></MainLayout>
            </RouteGuard>
          } 
        />
        <Route 
          path="/profile/:id" 
          element={
            <RouteGuard>
              <MainLayout><UserProfile /></MainLayout>
            </RouteGuard>
          } 
        />
        <Route 
          path="/event/:id" 
          element={
            <RouteGuard>
              <MainLayout><EventDetail /></MainLayout>
            </RouteGuard>
          } 
        />
        <Route 
          path="/clubs" 
          element={
            <RouteGuard>
              <MainLayout><ClubList /></MainLayout>
            </RouteGuard>
          } 
        />
        <Route 
          path="/club/:id" 
          element={
            <RouteGuard>
              <MainLayout><ClubDetail /></MainLayout>
            </RouteGuard>
          } 
        />
        <Route 
          path="/feed" 
          element={
            <RouteGuard>
              <MainLayout><SocialFeed /></MainLayout>
            </RouteGuard>
          } 
        />
        <Route 
          path="/create-post" 
          element={
            <RouteGuard>
              <MainLayout><CreatePost /></MainLayout>
            </RouteGuard>
          } 
        />
        <Route 
          path="/post/:id" 
          element={
            <RouteGuard>
              <MainLayout><PostDetail /></MainLayout>
            </RouteGuard>
          } 
        />

        {/* ---------------------------------- */}
        {/* --- ORGANIZER / ADMIN ROUTES --- */}
        {/* ---------------------------------- */}
        <Route
          path="/create-event"
          element={
            <RouteGuard roles={['ORGANIZER', 'ADMIN']}>
              <MainLayout><CreateEvent /></MainLayout>
            </RouteGuard>
          }
        />
        <Route
          path="/event/:id/post-results"
          element={
            <RouteGuard roles={['ORGANIZER', 'ADMIN']}>
              <MainLayout><PostResults /></MainLayout>
            </RouteGuard>
          }
        />
        <Route
          path="/create-club"
          element={
            <RouteGuard roles={['ORGANIZER', 'ADMIN']}>
              <MainLayout><CreateClub /></MainLayout>
            </RouteGuard>
          }
        />

        {/* ---------------------------------- */}
        {/* --- ADMIN ONLY ROUTES --- */}
        {/* ---------------------------------- */}
        <Route
          path="/admin"
          element={
            <RouteGuard roles={['ADMIN']}>
              <MainLayout><AdminDashboard /></MainLayout>
            </RouteGuard>
          }
        />
        <Route
          path="/admin/create-club"
          element={
            <RouteGuard roles={['ADMIN']}>
              <MainLayout><CreateClub /></MainLayout>
            </RouteGuard>
          }
        />

        {/* Catch-all: redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
