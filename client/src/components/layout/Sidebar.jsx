import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  BookOpen,
  Settings,
  LogOut,
  Link as LinkIcon,
  Calendar,
} from 'lucide-react';

/**
 * Sidebar — dashboard side navigation
 */
export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/dashboard/events', icon: CalendarDays, label: 'Event Types' },
    { to: '/dashboard/availability', icon: Clock, label: 'Availability' },
    { to: '/dashboard/bookings', icon: BookOpen, label: 'Bookings' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    borderRadius: 'var(--radius)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: isActive ? 500 : 400,
    color: isActive ? 'var(--primary-light)' : 'var(--text-secondary)',
    background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
    transition: 'var(--transition)',
  });

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}

      <aside
        className="sidebar glass"
        style={{
          width: 260,
          minHeight: 'calc(100vh - 64px)',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
          borderTop: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          position: 'sticky',
          top: 64,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}
      >
        {/* User Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 8px 20px',
          borderBottom: '1px solid var(--border)',
          marginBottom: 20,
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 600,
            color: 'white',
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              @{user?.username}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              style={({ isActive }) => linkStyle(isActive)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sharing link */}
        {user && (
          <div style={{
            marginTop: 'auto',
            padding: '16px',
            background: 'rgba(99, 102, 241, 0.05)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              <LinkIcon size={13} style={{ display: 'inline', marginRight: 4 }} />
              Your public page
            </div>
            <div style={{
              fontSize: 13,
              color: 'var(--primary-light)',
              wordBreak: 'break-all',
            }}>
              /{user.username}
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-ghost"
          style={{
            marginTop: 16,
            justifyContent: 'flex-start',
            color: 'var(--text-muted)',
          }}
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            top: 0 !important;
            left: ${isOpen ? '0' : '-280px'};
            height: 100vh !important;
            z-index: 50;
            transition: left 0.3s ease;
          }
          .sidebar-overlay {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
