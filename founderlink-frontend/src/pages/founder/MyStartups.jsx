import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Rocket } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import useAuth from '../../hooks/useAuth';
import { getStartupsByFounder, deleteStartup } from '../../api/startupApi';

const MyStartups = () => {
  const { userId } = useAuth();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!userId) return;
    getStartupsByFounder(userId)
      .then((res) => setStartups(res.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this startup?')) return;
    try {
      await deleteStartup(id);
      toast.success('Startup deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Startups</h1>
            <p className="text-gray-400 text-sm mt-1">{startups.length} startup{startups.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/founder/startups/create" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Startup
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-dark-800 rounded-xl animate-pulse border border-dark-500" />)}
          </div>
        ) : startups.length === 0 ? (
          <div className="card text-center py-14">
            <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
              <Rocket size={24} className="text-gray-500" />
            </div>
            <p className="text-gray-300 font-medium mb-1">No startups yet</p>
            <p className="text-gray-500 text-sm mb-5">Create your first startup to get started</p>
            <Link to="/founder/startups/create" className="btn-primary">Create your first startup</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {startups.map((s) => (
              <div key={s.id} className="card flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-white">{s.name}</h3>
                    <span className={s.isApproved ? 'badge-green' : s.isRejected ? 'badge-red' : 'badge-yellow'}>
                      {s.isApproved ? 'Approved' : s.isRejected ? 'Rejected' : 'Pending'}
                    </span>
                    <span className="badge-blue">{s.stage === 'EARLY_TRACTION' ? 'Early Traction' : s.stage}</span>
                  </div>
                  <p className="text-gray-500 text-sm truncate">{s.industry} · {s.location}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/founder/team/${s.id}`}
                    className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 px-3"
                  >
                    <Users size={13} /> Team
                  </Link>
                  <Link
                    to={`/founder/startups/${s.id}/edit`}
                    className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 px-3"
                  >
                    <Edit size={13} /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="btn-danger flex items-center gap-1.5 text-sm py-1.5 px-3"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyStartups;
