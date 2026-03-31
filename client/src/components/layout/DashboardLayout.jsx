import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

/**
 * DashboardLayout — wraps all dashboard pages with sidebar + content area
 */
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main style={{
        flex: 1,
        padding: '32px 24px',
        maxWidth: 900,
        width: '100%',
      }}>
        {/* Mobile sidebar trigger */}
        <button
          className="btn btn-ghost sidebar-trigger"
          onClick={() => setSidebarOpen(true)}
          style={{ display: 'none', marginBottom: 16, padding: 8 }}
        >
          <Menu size={20} />
        </button>

        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-trigger { display: flex !important; }
          main { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
}
