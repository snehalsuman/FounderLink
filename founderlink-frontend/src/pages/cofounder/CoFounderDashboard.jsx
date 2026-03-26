import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Mail, Search, Rocket } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import { getMyInvitations } from '../../api/teamApi';
import { getStartupById } from '../../api/startupApi';

export default function CoFounderDashboard() {
  const navigate = useNavigate();

  const [invitations, setInvitations]   = useState([]);
  const [teamsJoined, setTeamsJoined]   = useState([]);
  const [startupMap, setStartupMap]     = useState({});
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    getMyInvitations()
      .then(res => {
        const allInvites = res.data || [];
        setInvitations(allInvites);
        const accepted = allInvites.filter(i => i.status === 'ACCEPTED');
        setTeamsJoined(accepted);
        const uniqueIds = [...new Set(allInvites.map(i => i.startupId))];
        Promise.all(uniqueIds.map(id => getStartupById(id).then(r => [id, r.data]).catch(() => [id, null])))
          .then(entries => setStartupMap(Object.fromEntries(entries)));
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const pending  = invitations.filter(i => i.status === 'PENDING');

  const ROLE_LABEL = {
    CTO:             'CTO',
    CPO:             'CPO',
    MARKETING_HEAD:  'Marketing Head',
    ENGINEERING_LEAD:'Engineering Lead',
    CO_FOUNDER:      'Co-Founder',
  };

  const ROLE_BADGE = {
    CTO:             'badge-blue',
    CPO:             'badge-blue',
    MARKETING_HEAD:  'badge-green',
    ENGINEERING_LEAD:'badge-yellow',
    CO_FOUNDER:      'badge-purple',
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Co-Founder Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Explore startup opportunities, manage your invitations, and collaborate with founders.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Teams Joined</p>
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <Users size={18} className="text-accent-light" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-2">{teamsJoined.length}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Pending Invites</p>
              <div className="w-9 h-9 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                <Mail size={18} className="text-yellow-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-2">{pending.length}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Opportunities</p>
              <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
                <Search size={18} className="text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-2">
              <button
                onClick={() => navigate('/cofounder/startups')}
                className="text-green-400 text-sm font-medium hover:text-green-300 transition-colors"
              >
                Browse →
              </button>
            </p>
          </div>
        </div>

        {/* Teams you've joined */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Users size={16} className="text-accent-light" /> Teams You've Joined
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-14 bg-dark-700 rounded-lg animate-pulse" />)}
            </div>
          ) : teamsJoined.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-3">
                <Rocket size={20} className="text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">Not part of any team yet.</p>
              <p className="text-gray-600 text-sm">Accept an invitation or browse startups.</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-500">
              {teamsJoined.map(inv => (
                <div key={inv.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <Rocket size={15} className="text-accent-light" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-200">
                        {startupMap[inv.startupId]?.name || `Startup #${inv.startupId}`}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {startupMap[inv.startupId]?.industry ? `${startupMap[inv.startupId].industry} · ` : ''}Joined {new Date(inv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={ROLE_BADGE[inv.role] || 'badge-blue'}>
                    {ROLE_LABEL[inv.role] || inv.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
