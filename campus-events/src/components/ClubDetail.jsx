import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import api from '../utils/api';

const ClubDetail = () => {
  const [clubs, setClubs] = useState([]);
  const { id } = useParams();
  const { user } = useAuth()
  useEffect(() => {
    const fetchClub = async () => {
      try {
        const response = await api.get('/api/clubs');
        setClubs(response.data);
      } catch (e) {
        console.log('Error occurred', e);
      }
    };
    fetchClub();
  }, []);

  const handleDelete = async (clubId) => {
    //  Confirm with the user
    const confirmed = window.confirm("Are you sure you want to delete this club?");
    if (!confirmed) return;

    try {

      const token = localStorage.getItem("token");
      const response = await api.delete(`/api/clubs/${clubId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data.message);

      window.location.href = "/clubs";
      // Or, if you prefer React Router:
      // navigate('/clubs');
    } catch (err) {
      console.error("Error deleting club:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to delete club");
    }
  };


  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {clubs
        .filter(club => club.id === Number(id))
        .map(club => (
          <div
            key={club.id}
            className="futuristic-card overflow-hidden"
          >

            {/* Logo */}
            <div className="relative h-96 overflow-hidden">
              <img
                src={
                  club.club_logo_url ||
                  `https://placehold.co/200x200/e0e7ff/4338ca?text=${club.name[0]}`
                }
                alt={club.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-slate-100">
                    {club.name}
                  </h1>
                  <p className="text-slate-400 mt-2">Organized by {club.organizer?.name}</p>
                </div>
                {(club.organizer?.id === user?.id || user?.role==='ADMIN') && (
                  <button
                    className="futuristic-button-secondary text-slate-200"
                    onClick={() => handleDelete(club.id)}
                  >
                    Delete Club
                  </button>
                )}
              </div>

              <p className="text-slate-300 leading-relaxed">
                {club.description}
              </p>

              {club.organizer && (
                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={
                      club.organizer.profile_photo ||
                      `https://placehold.co/40x40/e0e7ff/4338ca?text=${club.organizer.name[0]}`
                    }
                    alt={club.organizer.name}
                    className="h-12 w-12 rounded-full object-cover border border-cyan-400/20"
                  />
                  <div>
                    <p className="text-sm text-slate-400">Organized by</p>
                    <p className="font-semibold text-slate-100">
                      {club.organizer.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="futuristic-card p-5 text-center">
                  <p className="text-3xl font-bold text-cyan-300">
                    {club._count?.events ?? 0}
                  </p>
                  <p className="text-sm text-slate-400">Events</p>
                </div>

                <div className="futuristic-card p-5 text-center">
                  <p className="text-3xl font-bold text-cyan-300">
                    {club._count?.members ?? 0}
                  </p>
                  <p className="text-sm text-slate-400">Members</p>
                </div>

                <div className="futuristic-card p-5 text-center">
                  <p className="text-sm font-semibold text-slate-100">
                    {new Date(club.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-400">Created On</p>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ClubDetail;
