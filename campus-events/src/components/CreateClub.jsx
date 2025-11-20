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

  // Fetch all users and filter for Organizers
  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/admin/users");
        const orgUsers = response.data.filter(
          (user) => user.role === "ORGANIZER"
        );
        setOrganizers(orgUsers);

        // Set default selection if organizers exist
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

  //  Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //  Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Ensure organizer_id is an integer
      const dataToSubmit = {
        ...formData,
        organizer_id: parseInt(formData.organizer_id, 10),
      };

      await api.post("/api/clubs", dataToSubmit);

      // Success! Go back to the main clubs list
      navigate("/clubs");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create club");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Create New Club</h1>
      <form style={styles.form} onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}

        {organizers.length === 0 ? (
          <ErrorMessage message="No Organizers found. Please promote a Student to an Organizer on the Admin Dashboard before creating a club." />
        ) : (
          <>
            <div style={styles.field}>
              <label htmlFor="name" style={styles.label}>
                Club Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                style={styles.input}
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="organizer_id" style={styles.label}>
                Assign to Organizer
              </label>
              <select
                name="organizer_id"
                id="organizer_id"
                required
                style={styles.input}
                value={formData.organizer_id}
                onChange={handleChange}
              >
                {organizers.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label htmlFor="description" style={styles.label}>
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows="4"
                style={styles.textarea}
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit" style={styles.button} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Club"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

// --- STYLES ---
const styles = {
  container: {
    maxWidth: "700px",
    margin: "32px auto",
    padding: "40px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: "24px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  field: {
    width: "100%",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#f9fafb",
    fontSize: "16px",
    color: "#2d3748",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px 15px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#f9fafb",
    fontSize: "16px",
    color: "#2d3748",
    fontFamily: "Inter, system-ui, sans-serif",
    boxSizing: "border-box",
    resize: "vertical",
  },
  button: {
    padding: "14px 20px",
    backgroundColor: "#4c51bf",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    marginTop: "10px",
  },
};
