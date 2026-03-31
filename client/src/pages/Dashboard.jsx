import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { CalendarDays, BookOpen, Clock, ArrowRight, Plus } from 'lucide-react';
import { format, isAfter } from 'date-fns';

/**
 * Dashboard — main dashboard home showing overview stats and upcoming bookings
 */
export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ events: 0, upcoming: 0, total: 0 });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, bookingsRes] = await Promise.all([
        API.get('/event-types'),
        API.get('/bookings'),
      ]);

      const events = eventsRes.data.eventTypes;
      const bookings = bookingsRes.data.bookings;
      const now = new Date();

      const upcoming = bookings.filter(
        b => b.status !== 'CANCELLED' && isAfter(new Date(b.startTime), now)
      );

      setStats({
        events: events.length,
        upcoming: upcoming.length,
        total: bookings.length,
      });

      setUpcomingBookings(upcoming.slice(0, 5));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: <CalendarDays size={22} />, label: 'Event Types', value: stats.events, color: '#6366f1' },
    { icon: <Clock size={22} />, label: 'Upcoming', value: stats.upcoming, color: '#06d6a0' },
    { icon: <BookOpen size={22} />, label: 'Total Bookings', value: stats.total, color: '#f59e0b' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Here's an overview of your scheduling activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        {statCards.map((card, i) => (
          <div key={i} className="glass-card" style={{ padding: 24 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${card.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
              }}>
                {card.icon}
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
              {card.value}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 32,
        flexWrap: 'wrap',
      }}>
        <Link to="/dashboard/events" className="btn btn-primary">
          <Plus size={16} /> Create Event Type
        </Link>
        <Link to="/dashboard/availability" className="btn btn-secondary">
          <Clock size={16} /> Set Availability
        </Link>
      </div>

      {/* Upcoming Bookings */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Upcoming Bookings</h2>
          <Link to="/dashboard/bookings" className="btn btn-ghost btn-sm">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="glass-card" style={{
            padding: 40,
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}>
            <BookOpen size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
            <p>No upcoming bookings yet.</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              Share your booking link to get started!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcomingBookings.map(booking => (
              <div key={booking._id} className="glass-card" style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {booking.guestName}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {booking.eventType?.title} · {booking.guestEmail}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {format(new Date(booking.startTime), 'MMM d, yyyy')}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                  </div>
                </div>
                <span className={`badge badge-${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
