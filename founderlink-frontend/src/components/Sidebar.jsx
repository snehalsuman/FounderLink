import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Rocket, Search, DollarSign, ShieldCheck, TrendingUp, Mail } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Sidebar = () => {
  const { isFounder, isInvestor, isCoFounder } = useAuth();

  const founderLinks = [
    { to: '/founder/dashboard',   icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/founder/startups',    icon: <Rocket size={18} />,          label: 'My Startups' },
    { to: '/founder/investments', icon: <DollarSign size={18} />,      label: 'Investment Requests' },
  ];

  const coFounderLinks = [
    { to: '/cofounder/dashboard',  icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/cofounder/startups',   icon: <Search size={18} />,          label: 'Browse Startups' },
    { to: '/founder/invitations',  icon: <Mail size={18} />,            label: 'My Invitations' },
  ];

  const investorLinks = [
    { to: '/investor/dashboard',   icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/investor/startups',    icon: <Search size={18} />,          label: 'Browse Startups' },
    { to: '/investor/investments', icon: <TrendingUp size={18} />,      label: 'My Investments' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: <ShieldCheck size={18} />, label: 'Approvals' },
  ];

  const links = isFounder   ? founderLinks
              : isCoFounder ? coFounderLinks
              : isInvestor  ? investorLinks
              : adminLinks;

  const roleLabel = isFounder   ? 'Founder'
                  : isCoFounder ? 'Co-Founder'
                  : isInvestor  ? 'Investor'
                  : 'Admin';

  const roleColor = isFounder   ? 'text-accent-light'
                  : isCoFounder ? 'text-purple-400'
                  : isInvestor  ? 'text-green-400'
                  : 'text-yellow-400';

  return (
    <aside className="w-60 bg-dark-800 border-r border-dark-500 min-h-screen flex flex-col">
      <div className="px-4 py-5 border-b border-dark-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent"></div>
          <span className={`text-xs font-semibold uppercase tracking-widest ${roleColor}`}>{roleLabel}</span>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-dark-500">
        <div className="px-3 py-2 text-xs text-gray-600">FounderLink v1.0</div>
      </div>
    </aside>
  );
};

export default Sidebar;
