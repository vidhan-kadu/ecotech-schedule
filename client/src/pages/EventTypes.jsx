import { useState, useEffect } from "react";
import API from "../api/axios";
import {
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Edit3,
  X,
  Check,
} from "lucide-react";

/**
 * EventTypes — manage event types (create, edit, delete)
 */
export default function EventTypes() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copied, setCopied] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: 30,
    location: "Google Meet",
    color: "#6366f1",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get("/event-types");
      setEvents(res.data.eventTypes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/event-types/${editingId}`, form);
      } else {
        await API.post("/event-types", form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({
        title: "",
        description: "",
        duration: 30,
        location: "Google Meet",
        color: "#6366f1",
      });
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving event type");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event type?")) return;
    try {
      await API.delete(`/event-types/${id}`);
      fetchEvents();
    } catch (err) {
      alert("Error deleting event type");
    }
  };

  const handleEdit = (event) => {
    setForm({
      title: event.title,
      description: event.description,
      duration: event.duration,
      location: event.location,
      color: event.color,
    });
    setEditingId(event._id);
    setShowForm(true);
  };

  const handleToggle = async (event) => {
    try {
      await API.put(`/event-types/${event._id}`, { isActive: !event.isActive });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const copyLink = (event) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const link = `${window.location.origin}/${user.username}/${event.slug}`;
    navigator.clipboard.writeText(link);
    setCopied(event._id);
    setTimeout(() => setCopied(""), 2000);
  };

  const colors = [
    "#6366f1",
    "#06d6a0",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#8b5cf6",
    "#14b8a6",
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
            Event Types
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Create and manage your meeting types
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm({
              title: "",
              description: "",
              duration: 30,
              location: "Google Meet",
              color: "#6366f1",
            });
          }}
        >
          <Plus size={16} /> New Event
        </button>
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 24,
          }}
        >
          <div
            className="glass-card animate-fadeInUp"
            style={{ width: "100%", maxWidth: 480, padding: 32 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>
                {editingId ? "Edit Event Type" : "New Event Type"}
              </h2>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                style={{ padding: 6 }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div>
                <label className="input-label">Title</label>
                <input
                  className="input-field"
                  placeholder="e.g., 30-Minute Meeting"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="input-label">Description</label>
                <textarea
                  className="input-field"
                  placeholder="Brief description..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label className="input-label">Duration (minutes)</label>
                  <select
                    className="input-field"
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: parseInt(e.target.value) })
                    }
                  >
                    {[15, 30, 45, 60, 90, 120].map((d) => (
                      <option key={d} value={d}>
                        {d} min
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Location</label>
                  <input
                    className="input-field"
                    placeholder="Google Meet"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Color</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: c,
                        border:
                          form.color === c
                            ? "2px solid white"
                            : "2px solid transparent",
                        cursor: "pointer",
                        transition: "var(--transition)",
                      }}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ marginTop: 8 }}
              >
                {editingId ? "Update Event Type" : "Create Event Type"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: 48,
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <p style={{ marginBottom: 8 }}>No event types yet.</p>
          <p style={{ fontSize: 13 }}>
            Create your first event type to start accepting bookings.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {events.map((event) => (
            <div
              key={event._id}
              className="glass-card"
              style={{
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 40,
                  borderRadius: 4,
                  background: event.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 180 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600 }}>
                    {event.title}
                  </span>
                  {!event.isActive && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 10,
                        background: "rgba(100,116,139,0.2)",
                        color: "var(--text-muted)",
                      }}
                    >
                      Inactive
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {event.duration} min · {event.location}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <a 
                  href={`/${JSON.parse(localStorage.getItem('user')).username}/${event.slug}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm" 
                  title="Open booking page"
                >
                  <ExternalLink size={15} />
                </a>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => copyLink(event)}
                  title="Copy link"
                >
                  {copied === event._id ? (
                    <Check size={15} color="var(--success)" />
                  ) : (
                    <Copy size={15} />
                  )}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleEdit(event)}
                  title="Edit"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleToggle(event)}
                  title={event.isActive ? "Deactivate" : "Activate"}
                >
                  {event.isActive ? "🟢" : "⚪"}
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(event._id)}
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
