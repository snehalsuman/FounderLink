import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, DollarSign, TrendingUp, ArrowRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import useAuth from '../../hooks/useAuth';
import { getAllStartups } from '../../api/startupApi';
import { getPaymentsByInvestor } from '../../api/paymentApi';

const InvestorDashboard = () => {
  const { user } = useAuth();
  const [startups, setStartups] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    getAllStartups().then(res => setStartups(res.data?.content || [])).catch(() => {});
    if (user?.userId) {
      getPaymentsByInvestor(user.userId).then(res => setPayments(res.data || [])).catch(() => {});
    }
  }, [user]);

  const confirmed = payments.filter(p => p.status === 'SUCCESS');
  const totalInvested = confirmed.reduce((sum, p) => sum + Number(p.amount), 0);

  const statusIcon = (status) => {
    if (status === 'SUCCESS') return <CheckCircle size={14} className="text-green-400" />;
    if (status === 'REJECTED') return <XCircle size={14} className="text-red-400" />;
    if (status === 'AWAITING_APPROVAL') return <Clock size={14} className="text-yellow-400" />;
    return <Clock size={14} className="text-gray-400" />;
  };

  const statusBadge = (status) => {
    if (status === 'SUCCESS') return 'badge-green';
    if (status === 'REJECTED') return 'badge-red';
    if (status === 'AWAITING_APPROVAL') return 'badge-yellow';
    return 'badge-yellow';
  };

  const statusLabel = (status) => {
    if (status === 'SUCCESS') return 'CONFIRMED';
    if (status === 'AWAITING_APPROVAL') return 'PENDING';
    return status;
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">Your investment portfolio at a glance</p>
          </div>
          <Link to="/investor/startups" className="btn-primary flex items-center gap-2">
            <Search size={16} /> Browse Startups
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Available Startups</p>
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <Search size={18} className="text-accent-light" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{startups.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">My Investments</p>
              <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
                <DollarSign size={18} className="text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{payments.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total Invested</p>
              <div className="w-9 h-9 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                <TrendingUp size={18} className="text-yellow-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">₹{totalInvested.toLocaleString()}</p>
          </div>
        </div>

        {/* Recent investments */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Recent Investments</h2>
            <Link to="/investor/investments" className="text-sm text-accent-light hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={24} className="text-gray-500" />
              </div>
              <p className="text-gray-400 mb-4">No investments yet</p>
              <Link to="/investor/startups" className="btn-primary">Browse Startups</Link>
            </div>
          ) : (
            <div className="divide-y divide-dark-500">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {statusIcon(payment.status)}
                    <div>
                      <p className="font-medium text-gray-100">{payment.startupName}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-white">₹{Number(payment.amount).toLocaleString()}</p>
                    <span className={statusBadge(payment.status)}>{statusLabel(payment.status)}</span>
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

export default InvestorDashboard;
