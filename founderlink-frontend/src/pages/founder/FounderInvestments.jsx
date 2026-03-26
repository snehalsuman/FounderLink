import { useCallback, useEffect, useState } from 'react';
import { DollarSign, CheckCircle, XCircle, Clock, Rocket } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import useAuth from '../../hooks/useAuth';
import { getStartupsByFounder } from '../../api/startupApi';
import { getInvestmentsByStartup, approveInvestment, rejectInvestment } from '../../api/investmentApi';
import { getUsersByRole } from '../../api/userApi';

const FounderInvestments = () => {
  const { userId } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [startupMap, setStartupMap] = useState({});
  const [investorMap, setInvestorMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const startupsRes = await getStartupsByFounder(userId);
      const startups = startupsRes.data || [];

      // build a map of startupId → startupName for display
      const map = {};
      startups.forEach(s => { map[s.id] = s.name; });
      setStartupMap(map);

      // fetch investments for each startup in parallel
      const [investmentResults, investorsRes] = await Promise.all([
        Promise.all(startups.map(s => getInvestmentsByStartup(s.id).then(r => r.data || []).catch(() => []))),
        getUsersByRole('ROLE_INVESTOR').then(r => r.data || []).catch(() => []),
      ]);
      setInvestments(investmentResults.flat());

      const iMap = {};
      investorsRes.forEach(u => { iMap[u.userId] = u; });
      setInvestorMap(iMap);
    } catch {
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve');
    try {
      await approveInvestment(id);
      toast.success('Investment approved!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id + '_reject');
    try {
      await rejectInvestment(id);
      toast.success('Investment rejected');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const pending  = investments.filter(i => i.status === 'PENDING');
  const resolved = investments.filter(i => i.status !== 'PENDING');

  const statusBadge = (status) => {
    if (status === 'APPROVED') return <span className="badge-green">Approved</span>;
    if (status === 'REJECTED') return <span className="badge-red">Rejected</span>;
    if (status === 'COMPLETED') return <span className="badge-blue">Completed</span>;
    return <span className="badge-yellow">Pending</span>;
  };

  const statusIcon = (status) => {
    if (status === 'APPROVED') return <CheckCircle size={16} className="text-green-400" />;
    if (status === 'REJECTED') return <XCircle size={16} className="text-red-400" />;
    if (status === 'COMPLETED') return <CheckCircle size={16} className="text-blue-400" />;
    return <Clock size={16} className="text-yellow-400" />;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Investment Requests</h1>
          <p className="text-gray-400 text-sm mt-1">Review and manage investor interest in your startups</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total Requests</p>
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <DollarSign size={18} className="text-accent-light" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{investments.length}</p>
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
              <p className="text-gray-400 text-sm">Approved</p>
              <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
                <CheckCircle size={18} className="text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {investments.filter(i => i.status === 'APPROVED').length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-dark-800 rounded-xl animate-pulse border border-dark-500" />
            ))}
          </div>
        ) : investments.length === 0 ? (
          <div className="card text-center py-14">
            <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
              <Rocket size={24} className="text-gray-500" />
            </div>
            <p className="text-gray-300 font-medium">No investment requests yet</p>
            <p className="text-gray-500 text-sm mt-1">Investors will appear here once they express interest in your startups</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Pending requests — needs action */}
            {pending.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock size={14} /> Awaiting Your Review ({pending.length})
                </h2>
                <div className="space-y-3">
                  {pending.map(inv => (
                    <div key={inv.id} className="card border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                            <DollarSign size={18} className="text-yellow-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {startupMap[inv.startupId] || `Startup #${inv.startupId}`}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {investorMap[inv.investorId]?.name || investorMap[inv.investorId]?.email || `Investor #${inv.investorId}`} · {new Date(inv.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-bold text-white">
                            ${Number(inv.amount).toLocaleString()}
                          </p>
                          <button
                            onClick={() => handleApprove(inv.id)}
                            disabled={!!actionLoading}
                            className="btn-success flex items-center gap-1.5 text-sm py-1.5 px-4"
                          >
                            <CheckCircle size={14} />
                            {actionLoading === inv.id + '_approve' ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(inv.id)}
                            disabled={!!actionLoading}
                            className="btn-danger flex items-center gap-1.5 text-sm py-1.5 px-4"
                          >
                            <XCircle size={14} />
                            {actionLoading === inv.id + '_reject' ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolved requests */}
            {resolved.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Past Decisions ({resolved.length})
                </h2>
                <div className="card divide-y divide-dark-500">
                  {resolved.map(inv => (
                    <div key={inv.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {statusIcon(inv.status)}
                        <div>
                          <p className="font-medium text-gray-200">
                            {startupMap[inv.startupId] || `Startup #${inv.startupId}`}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {investorMap[inv.investorId]?.name || investorMap[inv.investorId]?.email || `Investor #${inv.investorId}`} · {new Date(inv.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-white">${Number(inv.amount).toLocaleString()}</p>
                        {statusBadge(inv.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </Layout>
  );
};

export default FounderInvestments;
