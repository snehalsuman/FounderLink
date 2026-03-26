import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, ShieldCheck, Building2, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import Layout from '../../components/Layout';
import { getAllStartupsAdmin, approveStartup, rejectStartup } from '../../api/startupApi';

const AdminDashboard = () => {
  const [startups, setStartups]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = () => {
    getAllStartupsAdmin()
      .then(res => setStartups(res.data?.content || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve');
    try {
      await approveStartup(id);
      toast.success('Startup approved!');
      setExpandedId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    setActionLoading(id + '_reject');
    try {
      await rejectStartup(id);
      toast.success('Startup rejected.');
      setExpandedId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally { setActionLoading(null); }
  };

  const pending  = startups.filter(s => !s.isApproved && !s.isRejected);
  const approved = startups.filter(s => s.isApproved);
  const rejected = startups.filter(s => s.isRejected);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Review and manage startup submissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total</p>
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <Building2 size={18} className="text-accent-light" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{startups.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Pending</p>
              <div className="w-9 h-9 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                <Clock size={18} className="text-yellow-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{pending.length}</p>
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
              <p className="text-gray-400 text-sm">Rejected</p>
              <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center">
                <XCircle size={18} className="text-red-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{rejected.length}</p>
          </div>
        </div>

        {/* Pending approvals */}
        <div>
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={16} className="text-yellow-400" />
            Pending Review
            {pending.length > 0 && <span className="badge-yellow ml-1">{pending.length}</span>}
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-20 bg-dark-800 rounded-xl animate-pulse" />)}
            </div>
          ) : pending.length === 0 ? (
            <div className="card text-center py-10">
              <ShieldCheck size={36} className="mx-auto text-green-400 mb-3" />
              <p className="text-gray-300 font-medium">All caught up!</p>
              <p className="text-gray-500 text-sm mt-1">No startups pending review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(s => (
                <div key={s.id} className="card">
                  {/* Summary row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-white">{s.name}</h3>
                        <span className="badge-blue">{s.stage === 'EARLY_TRACTION' ? 'Early Traction' : s.stage}</span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {s.industry} · {s.location} · ${Number(s.fundingGoal).toLocaleString()} goal
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Review toggle */}
                      <button
                        onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                        className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 px-3"
                      >
                        <Eye size={14} />
                        Review
                        {expandedId === s.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                      <button
                        onClick={() => handleApprove(s.id)}
                        disabled={!!actionLoading}
                        className="btn-success flex items-center gap-1.5 text-sm py-1.5 px-3 whitespace-nowrap"
                      >
                        <CheckCircle size={14} />
                        {actionLoading === s.id + '_approve' ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(s.id)}
                        disabled={!!actionLoading}
                        className="btn-danger flex items-center gap-1.5 text-sm py-1.5 px-3 whitespace-nowrap"
                      >
                        <XCircle size={14} />
                        {actionLoading === s.id + '_reject' ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded review panel */}
                  {expandedId === s.id && (
                    <div className="mt-4 pt-4 border-t border-dark-500 space-y-3">
                      {s.description && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Description</p>
                          <p className="text-gray-300 text-sm">{s.description}</p>
                        </div>
                      )}
                      {s.problemStatement && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Problem Statement</p>
                          <p className="text-gray-300 text-sm">{s.problemStatement}</p>
                        </div>
                      )}
                      {s.solution && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Solution</p>
                          <p className="text-gray-300 text-sm">{s.solution}</p>
                        </div>
                      )}
                      <div className="flex gap-6 pt-1">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Funding Goal</p>
                          <p className="text-gray-200 text-sm font-medium">${Number(s.fundingGoal).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Submitted</p>
                          <p className="text-gray-200 text-sm">{new Date(s.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved */}
        {approved.length > 0 && (
          <div>
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" /> Approved Startups
            </h2>
            <div className="space-y-3">
              {approved.map(s => (
                <div key={s.id} className="card flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                  <div>
                    <p className="font-semibold text-gray-200">{s.name}</p>
                    <p className="text-gray-500 text-sm">{s.industry} · {s.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge-green flex items-center gap-1"><CheckCircle size={11} /> Approved</span>
                    <button
                      onClick={() => handleReject(s.id)}
                      disabled={!!actionLoading}
                      className="btn-danger flex items-center gap-1.5 text-sm py-1 px-2.5"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected */}
        {rejected.length > 0 && (
          <div>
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <XCircle size={16} className="text-red-400" /> Rejected Startups
            </h2>
            <div className="space-y-3">
              {rejected.map(s => (
                <div key={s.id} className="card flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                  <div>
                    <p className="font-semibold text-gray-200">{s.name}</p>
                    <p className="text-gray-500 text-sm">{s.industry} · {s.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge-red flex items-center gap-1"><XCircle size={11} /> Rejected</span>
                    <button
                      onClick={() => handleApprove(s.id)}
                      disabled={!!actionLoading}
                      className="btn-success flex items-center gap-1.5 text-sm py-1 px-2.5"
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default AdminDashboard;
