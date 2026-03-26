import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Bell, CheckCheck, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import useAuth from '../../hooks/useAuth';
import { getNotifications, markAsRead } from '../../api/notificationApi';
import { setUnreadCount } from '../../store/slices/notificationSlice';

const Notifications = () => {
  const { userId } = useAuth();
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    getNotifications(userId)
      .then(res => {
        const data = res.data?.data || [];
        setNotifications(data);
        dispatch(setUnreadCount(data.filter(n => !n.isRead).length));
      })
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, [userId, dispatch]);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      load();
    } catch { toast.error('Failed'); }
  };

  const unread = notifications.filter(n => !n.isRead);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bell size={22} className="text-accent-light" /> Notifications
            </h1>
            {unread.length > 0 && (
              <p className="text-gray-400 text-sm mt-1">{unread.length} unread</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-dark-800 rounded-xl animate-pulse border border-dark-500" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="card text-center py-14">
            <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-gray-500" />
            </div>
            <p className="text-gray-300 font-medium">All caught up!</p>
            <p className="text-gray-500 text-sm mt-1">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`card flex items-start justify-between gap-4 transition-all ${
                  !n.isRead ? 'border-l-2 border-l-accent bg-dark-700' : 'opacity-70'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    !n.isRead ? 'bg-accent/15' : 'bg-dark-600'
                  }`}>
                    <Mail size={14} className={!n.isRead ? 'text-accent-light' : 'text-gray-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${!n.isRead ? 'text-gray-100 font-medium' : 'text-gray-400'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-xs text-gray-600">{new Date(n.createdAt).toLocaleString()}</p>
                      <span className="badge-blue text-xs">{n.type}</span>
                    </div>
                  </div>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-2.5 shrink-0"
                  >
                    <CheckCheck size={12} /> Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
