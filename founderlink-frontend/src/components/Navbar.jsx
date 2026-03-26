import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, MessageSquare, LogOut, User } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { setUnreadCount } from '../store/slices/notificationSlice';
import { getUnreadNotifications } from '../api/notificationApi';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, userId, isFounder, isInvestor, isCoFounder } = useAuth();
  const unreadCount = useSelector((s) => s.notifications.unreadCount);

  // Poll unread count every 30 seconds
  useEffect(() => {
    if (!userId) return;
    const fetchUnread = () => {
      getUnreadNotifications(userId)
        .then(res => dispatch(setUnreadCount((res.data?.data || []).length)))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [userId, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const dashboardLink = isFounder
    ? '/founder/dashboard'
    : isInvestor
    ? '/investor/dashboard'
    : isCoFounder
    ? '/cofounder/dashboard'
    : '/admin/dashboard';

  return (
    <nav className="bg-dark-800 border-b border-dark-500 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to={dashboardLink} className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-white text-xs font-bold">FL</span>
        </div>
        <span className="text-lg font-bold text-white tracking-tight">FounderLink</span>
      </Link>

      <div className="flex items-center gap-1">
        {(isFounder || isInvestor || isCoFounder) && (
          <>
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-gray-100 transition-colors"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              to="/messages"
              className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-gray-100 transition-colors"
            >
              <MessageSquare size={19} />
            </Link>
          </>
        )}
        <Link
          to="/profile"
          className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-gray-100 transition-colors"
        >
          <User size={19} />
        </Link>
        <span className="text-sm text-gray-500 hidden md:block mx-2 border-l border-dark-400 pl-3">
          {user?.email}
        </span>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-red-400 transition-colors"
          title="Sign out"
        >
          <LogOut size={19} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
