import { useEffect, useState } from 'react';
import { Users, CheckCircle, XCircle, Rocket } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import { getMyInvitations, acceptInvitation, rejectInvitation } from '../../api/teamApi';
import { getStartupById } from '../../api/startupApi';

const ROLE_COLORS = {
  FOUNDER:          'badge-blue',
  CO_FOUNDER:       'badge-purple',
  CTO:              'badge-blue',
  CPO:              'badge-blue',
  MARKETING_HEAD:   'badge-green',
  ENGINEERING_LEAD: 'badge-yellow',
};

const MyInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [startupMap, setStartupMap]   = useState({});
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const load = () => {
    setLoading(true);
    getMyInvitations()
      .then(res => {
        const list = res.data || [];
        setInvitations(list);
        const uniqueIds = [...new Set(list.map(i => i.startupId))];
        Promise.all(uniqueIds.map(id => getStartupById(id).then(r => [id, r.data]).catch(() => [id, null])))
          .then(entries => setStartupMap(Object.fromEntries(entries)));
      })
      .catch(() => toast.error('Failed to load invitations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAccept = async (id) => {
    setActionLoading(id + '_accept');
    try {
      await acceptInvitation(id);
      toast.success('Invitation accepted! You are now part of the team.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id + '_reject');
    try {
      await rejectInvitation(id);
      toast.success('Invitation rejected.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const pending  = invitations.filter(i => i.status === 'PENDING');
  const resolved = invitations.filter(i => i.status !== 'PENDING');

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Invitations</h1>
          <p className="text-gray-400 text-sm mt-1">Accept or reject invitations from startup founders</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Pending</p>
              <div className="w-9 h-9 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                <Users size={18} className="text-yellow-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{pending.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Accepted</p>
              <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
                <CheckCircle size={18} className="text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {invitations.filter(i => i.status === 'ACCEPTED').length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-dark-800 rounded-xl animate-pulse border border-dark-500" />
            ))}
          </div>
        ) : invitations.length === 0 ? (
          <div className="card text-center py-14">
            <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
              <Rocket size={24} className="text-gray-500" />
            </div>
            <p className="text-gray-300 font-medium">No invitations yet</p>
            <p className="text-gray-500 text-sm mt-1">Founders will invite you to their startups here</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Pending — needs action */}
            {pending.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users size={14} /> Awaiting Your Response ({pending.length})
                </h2>
                <div className="space-y-3">
                  {pending.map(inv => (
                    <div key={inv.id} className="card border-accent/25 hover:border-accent/50 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                            <Users size={18} className="text-accent-light" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {startupMap[inv.startupId]?.name || `Startup #${inv.startupId}`}
                              <span className={`ml-2 ${ROLE_COLORS[inv.role] || 'badge-blue'}`}>
                                {inv.role?.replace('_', ' ')}
                              </span>
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {startupMap[inv.startupId]?.industry || ''}{startupMap[inv.startupId]?.industry ? ' · ' : ''}Invited {new Date(inv.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleAccept(inv.id)}
                            disabled={!!actionLoading}
                            className="btn-success flex items-center gap-1.5 text-sm py-1.5 px-4"
                          >
                            <CheckCircle size={14} />
                            {actionLoading === inv.id + '_accept' ? 'Accepting...' : 'Accept'}
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

            {/* Resolved */}
            {resolved.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Past Invitations ({resolved.length})
                </h2>
                <div className="card divide-y divide-dark-500">
                  {resolved.map(inv => (
                    <div key={inv.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          inv.status === 'ACCEPTED' ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-200">
                            {startupMap[inv.startupId]?.name || `Startup #${inv.startupId}`}
                          </p>
                          <p className="text-gray-500 text-xs">{new Date(inv.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={ROLE_COLORS[inv.role] || 'badge-blue'}>
                          {inv.role?.replace('_', ' ')}
                        </span>
                        <span className={inv.status === 'ACCEPTED' ? 'badge-green' : 'badge-red'}>
                          {inv.status}
                        </span>
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

export default MyInvitations;
