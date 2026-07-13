import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, IndianRupee, MessageCircle, Library } from 'lucide-react';

export default function Layout() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="flex items-center gap-md">
            <Library size={36} color="var(--primary-color)" />
            <h2 style={{ marginBottom: 0 }}>Library Pro</h2>
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
