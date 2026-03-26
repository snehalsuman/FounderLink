import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import useAuth from '../../hooks/useAuth';
import { getMyInvestments } from '../../api/investmentApi';
import { getStartupById } from '../../api/startupApi';

const MyInvestments = () => {
  const { userId } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [startupMap, setStartupMap]   = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getMyInvestments(userId)
      .then(res => {
        const list = res.data || [];
        setInvestments(list);
        const uniqueIds = [...new Set(list.map(i => i.startupId))];
        Promise.all(uniqueIds.map(id => getStartupById(id).then(r => [id, r.data]).catch(() => [id, null])))
          .then(entries => setStartupMap(Object.fromEntries(entries)));
      })
      .catch(() => toast.error('Failed to load investments'))
      .finally(() => setLoading(false));
  }, [userId]);

  const total = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const approved = investments.filter(i => i.status === 'APPROVED');
  const pending = investments.filter(i => i.status === 'PENDING');

  const statusIcon = (status) => {
    if (status === 'APPROVED') return <CheckCircle size={15} className="text-green-400" />;
    if (status === 'REJECTED') return <XCircle size={15} className="text-red-400" />;
    if (status === 'COMPLETED') return <CheckCircle size={15} className="text-blue-400" />;
    return <Clock size={15} className="text-yellow-400" />;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Investments</h1>
          <p className="text-gray-400 text-sm mt-1">Track all your investment activity</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total Invested</p>
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <TrendingUp size={18} className="text-accent-light" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">${total.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Approved</p>
              <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
                <CheckCircle size={18} className="text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{approved.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Pending</p>
              <div className="w-9 h-9 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                <Clock size={18} className="text-yellow-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{pending.length}</p>
          </div>
        </div>

        {/* Investment list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-dark-800 rounded-xl animate-pulse border border-dark-500" />)}
          </div>
        ) : investments.length === 0 ? (
          <div className="card text-center py-14">
            <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
              <DollarSign size={24} className="text-gray-500" />
            </div>
            <p className="text-gray-300 font-medium">No investments yet</p>
            <p className="text-gray-500 text-sm mt-1 mb-5">Find promising startups to invest in</p>
            <Link to="/investor/startups" className="btn-primary">Browse Startups</Link>
          </div>
        ) : (
          <div className="card">
            <div className="divide-y divide-dark-500">
              {investments.map((inv) => (
                <div key={inv.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {statusIcon(inv.status)}
                    <div>
                      <p className="font-semibold text-gray-100">
                        {startupMap[inv.startupId]?.name || `Startup #${inv.startupId}`}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {startupMap[inv.startupId]?.industry ? `${startupMap[inv.startupId].industry} · ` : ''}{new Date(inv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-white">${Number(inv.amount).toLocaleString()}</p>
                    <span className={
                      inv.status === 'APPROVED' ? 'badge-green' :
                      inv.status === 'REJECTED' ? 'badge-red' :
                      inv.status === 'COMPLETED' ? 'badge-blue' : 'badge-yellow'
                    }>
                      {inv.status}
                    </span>
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

export default MyInvestments;
