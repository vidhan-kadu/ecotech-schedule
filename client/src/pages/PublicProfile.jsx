import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { Calendar, Clock, MapPin, ArrowRight, User } from 'lucide-react';

/**
 * PublicProfile — shows a user's active event types for public booking
 * Route: /:username
 */
export default function PublicProfile() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/event-types/public/${username}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.status === 404 ? 'User not found' : 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>{error}</h2>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: 16 }}>Go Home</Link>
      </div>
    );
  }

  const { user, eventTypes } = data;

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 600 }} className="animate-fadeInUp">
        {/* User Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 700,
            color: 'white',
            margin: '0 auto 16px',
          }}>
            {user.name[0].toUpperCase()}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{user.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Choose an event type to schedule a time with me.
          </p>
        </div>

        {/* Event Types List */}
        {eventTypes.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No event types available at the moment.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {eventTypes.map(event => (
              <Link
                key={event._id}
                to={`/${username}/${event.slug}`}
                className="glass-card"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 4,
                  height: 48,
                  borderRadius: 4,
                  background: event.color,
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                    {event.title}
                  </div>
                  {event.description && (
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      {event.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} /> {event.duration} min
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} /> {event.location}
                    </span>
                  </div>
                </div>
                <ArrowRight size={18} color="var(--text-muted)" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
