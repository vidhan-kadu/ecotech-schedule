import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Navbar — top navigation bar
 * Shows branding + auth actions (login/register or user menu)
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 24px',
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          color: 'var(--text-primary)',
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Calendar size={20} color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>
            Eco<span style={{ color: 'var(--primary-light)' }}>Tech</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="nav-desktop" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                {user.name}
              </span>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile-toggle btn btn-ghost"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ display: 'none', padding: 8 }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="nav-mobile-menu animate-fadeIn" style={{
          padding: '16px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          borderTop: '1px solid var(--border)',
        }}>
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="btn btn-ghost">
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
