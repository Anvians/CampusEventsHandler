import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Spinner from '../components/common/Spinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function PostResults() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [registrants, setRegistrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [winner_id, setWinnerId] = useState('');
  const [runner_up_id, setRunnerUpId] = useState('');
  const [certification_url, setCertificationUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRegistrants = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/events/${eventId}/registrants`);
        setRegistrants(response.data);

        if (response.data.length === 0) {
          setError("There are no registered participants for this event yet.");
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch registrants');
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrants();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.post(`/api/events/${eventId}/results`, {
        winner_id: parseInt(winner_id, 10),
        runner_up_id: runner_up_id ? parseInt(runner_up_id, 10) : null,
        certification_url: certification_url || null,
      });
      navigate(`/event/${eventId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post results');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto p-10 bg-white rounded-2xl shadow-lg mt-10 font-inter">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">Post Event Results</h1>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

        {error && <ErrorMessage message={error} />}

        {/* Winner */}
        <div className="w-full">
          <label htmlFor="winner_id" className="block text-gray-600 font-semibold mb-2">Winner</label>
          <select
            id="winner_id"
            value={winner_id}
            onChange={(e) => setWinnerId(e.target.value)}
            required
            disabled={registrants.length === 0}
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
          >
            <option value="">Select a winner</option>
            {registrants.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {/* Runner-up */}
        <div className="w-full">
          <label htmlFor="runner_up_id" className="block text-gray-600 font-semibold mb-2">Runner-up (Optional)</label>
          <select
            id="runner_up_id"
            value={runner_up_id}
            onChange={(e) => setRunnerUpId(e.target.value)}
            disabled={registrants.length === 0 || !winner_id}
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
          >
            <option value="">Select a runner-up</option>
            {registrants.map(user => (
              user.id.toString() !== winner_id &&
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {/* Certification URL */}
        <div className="w-full">
          <label htmlFor="certification_url" className="block text-gray-600 font-semibold mb-2">
            Certification URL (Optional)
          </label>
          <input
            type="text"
            id="certification_url"
            value={certification_url}
            onChange={(e) => setCertificationUrl(e.target.value)}
            placeholder="https://example.com/certificate.pdf"
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || registrants.length === 0 || !winner_id}
          className={`w-full py-3 rounded-lg font-bold text-white ${
            isSubmitting || registrants.length === 0 || !winner_id
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isSubmitting ? 'Posting...' : 'Post Results'}
        </button>
      </form>
    </div>
  );
}
