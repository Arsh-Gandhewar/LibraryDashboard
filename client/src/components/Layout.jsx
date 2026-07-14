import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, IndianRupee, MessageCircle, Library, Menu, X } from 'lucide-react';

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
      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <Library size={32} color="var(--primary-color)" />
            <h2 style={{ marginBottom: 0 }}>Satyasai Abhyasika</h2>
          </div>
          
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <nav className={`navbar-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/students" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <Users size={20} />
              <span>Students</span>
            </NavLink>
            <NavLink to="/students/new" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <UserPlus size={20} />
              <span>New Admission</span>
            </NavLink>
            <NavLink to="/revenue" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <IndianRupee size={20} />
              <span>Revenue</span>
            </NavLink>
            <NavLink to="/reminders" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <MessageCircle size={20} />
              <span>Reminders</span>
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
