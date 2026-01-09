import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js"; 
import Spinner from "./common/Spinner.jsx"; 
import ErrorMessage from "./common/ErrorMessage.jsx"; 

export default function CreateClub() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    organizer_id: "",
  });
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/admin/users");
        const orgUsers = response.data.filter(
          (user) => user.role === "ORGANIZER"
        );
        setOrganizers(orgUsers);

        if (orgUsers.length > 0) {
          setFormData((prev) => ({ ...prev, organizer_id: orgUsers[0].id }));
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch organizers");
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const dataToSubmit = {
        ...formData,
        organizer_id: parseInt(formData.organizer_id, 10),
      };
      await api.post("/api/clubs", dataToSubmit);
      navigate("/clubs");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create club");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto mt-12 p-10 bg-white rounded-2xl shadow-lg font-inter">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Create New Club
      </h1>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}

        {organizers.length === 0 ? (
          <ErrorMessage message="No Organizers found. Please promote a Student to an Organizer on the Admin Dashboard before creating a club." />
        ) : (
          <>
            <div className="w-full">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-600 mb-2">
                Club Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="w-full">
              <label htmlFor="organizer_id" className="block text-sm font-semibold text-gray-600 mb-2">
                Assign to Organizer
              </label>
              <select
                name="organizer_id"
                id="organizer_id"
                required
                value={formData.organizer_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {organizers.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-600 mb-2">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-vertical"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-base hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Club"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
