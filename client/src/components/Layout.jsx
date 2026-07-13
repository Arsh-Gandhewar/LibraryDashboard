import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, IndianRupee, MessageCircle, Library, Menu } from 'lucide-react';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-header-title">
          <Library size={28} color="var(--primary-color)" />
          Satyasai
        </div>
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <Menu size={28} />
        </button>
      </div>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="flex items-center gap-md">
            <Library size={36} color="var(--primary-color)" />
            <h2 style={{ marginBottom: 0 }}>Satyasai Abhyasika</h2>
          </div>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <LayoutDashboard size={28} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/students" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <Users size={28} />
            <span>Students</span>
          </NavLink>
          <NavLink to="/students/new" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <UserPlus size={28} />
            <span>New Admission</span>
          </NavLink>
          <NavLink to="/revenue" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <IndianRupee size={28} />
            <span>Revenue</span>
          </NavLink>
          <NavLink to="/reminders" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <MessageCircle size={28} />
            <span>Reminders</span>
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
