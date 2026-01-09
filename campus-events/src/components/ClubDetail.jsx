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
    <div className="max-w-5xl  md:h-screen mx-auto px-10 py-8">
      {clubs
        .filter(club => club.id === Number(id))
        .map(club => (
          <div
            key={club.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
          >

            {/* Logo */}
            <div className="h-90 bg-indigo-50 flex items-center justify-center">
              <img
                src={
                  club.club_logo_url ||
                  `https://placehold.co/200x200/e0e7ff/4338ca?text=${club.name[0]}`
                }
                alt={club.name}
                className="h-full w-full object-cover rounded-t-xl"
              />
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className='flex justify-between'>
                <h1 className="text-3xl font-bold text-gray-900">
                  {club.name}
                </h1>
                {(club.organizer?.id === user?.id || user?.role==='ADMIN' ) && (
                  <button
                    className='bg-amber-700 rounded-2xl p-2 text-white'
                    onClick={() => handleDelete(club.id)} 
                  >
                    Delete Club
                  </button>
                )}

              </div>

              <p className="text-gray-600 leading-relaxed">
                {club.description}
              </p>

              {/* Organizer */}
              {club.organizer && (
                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={
                      club.organizer.profile_photo ||
                      `https://placehold.co/40x40/e0e7ff/4338ca?text=${club.organizer.name[0]}`
                    }
                    alt={club.organizer.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm text-gray-500">Organized by</p>
                    <p className="font-semibold text-gray-800">
                      {club.organizer.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-600">
                    {club._count?.events ?? 0}
                  </p>
                  <p className="text-sm text-gray-500">Events</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-600">
                    {club._count?.members ?? 0}
                  </p>
                  <p className="text-sm text-gray-500">Members</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    {new Date(club.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">Created On</p>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ClubDetail;
