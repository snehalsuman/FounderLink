import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, CheckCircle, Clock, XCircle, Plus, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import useAuth from '../../hooks/useAuth';
import { getStartupsByFounder } from '../../api/startupApi';

const FounderDashboard = () => {
  const { userId, user } = useAuth();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getStartupsByFounder(userId)
      .then((res) => setStartups(res.data || []))
      .catch(() => toast.error('Failed to load startups'))
      .finally(() => setLoading(false));
  }, [userId]);

  const approved = startups.filter((s) => s.isApproved);
  const rejected = startups.filter((s) => s.isRejected);
  const pending  = startups.filter((s) => !s.isApproved && !s.isRejected);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">Here's an overview of your startups</p>
          </div>
          <Link to="/founder/startups/create" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Startup
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total Startups</p>
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <Rocket size={18} className="text-accent-light" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{startups.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Approved</p>
              <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
                <CheckCircle size={18} className="text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{approved.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Pending Review</p>
              <div className="w-9 h-9 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                <Clock size={18} className="text-yellow-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{pending.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Rejected</p>
              <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center">
                <XCircle size={18} className="text-red-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{rejected.length}</p>
          </div>
        </div>

        {/* Recent startups */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">My Startups</h2>
            <Link to="/founder/startups" className="text-sm text-accent-light hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 bg-dark-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : startups.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
                <Rocket size={24} className="text-gray-500" />
              </div>
              <p className="text-gray-400 mb-4">You haven't created any startups yet</p>
              <Link to="/founder/startups/create" className="btn-primary">
                Create your first startup
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-dark-500">
              {startups.slice(0, 5).map((s) => (
                <div key={s.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-100">{s.name}</p>
                    <p className="text-gray-500 text-sm">{s.industry} · {s.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge-blue">{s.stage === 'EARLY_TRACTION' ? 'Early Traction' : s.stage}</span>
                    <span className={s.isApproved ? 'badge-green' : s.isRejected ? 'badge-red' : 'badge-yellow'}>
                      {s.isApproved ? 'Approved' : s.isRejected ? 'Rejected' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FounderDashboard;
