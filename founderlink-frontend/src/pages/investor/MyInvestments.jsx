import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, CheckCircle, Clock, CreditCard, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import useAuth from '../../hooks/useAuth';
import { getPaymentsByInvestor } from '../../api/paymentApi';

const MyInvestments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) return;
    getPaymentsByInvestor(user.userId)
      .then(res => setPayments(res.data || []))
      .catch(() => toast.error('Failed to load investments'))
      .finally(() => setLoading(false));
  }, [user]);

  const successful = payments.filter(p => p.status === 'SUCCESS');
  const totalInvested = successful.reduce((sum, p) => sum + Number(p.amount), 0);

  const statusBadge = (status) => {
    if (status === 'SUCCESS') return 'badge-green';
    if (status === 'FAILED' || status === 'REJECTED') return 'badge-red';
    return 'badge-yellow';
  };

  const statusLabel = (status) => {
    if (status === 'SUCCESS') return 'CONFIRMED';
    if (status === 'AWAITING_APPROVAL') return 'PENDING APPROVAL';
    return status;
  };

  const statusIcon = (status) => {
    if (status === 'SUCCESS') return <CheckCircle size={15} className="text-green-400" />;
    if (status === 'REJECTED') return <XCircle size={15} className="text-red-400" />;
    return <Clock size={15} className="text-yellow-400" />;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Investments</h1>
          <p className="text-gray-400 text-sm mt-1">Track all your investment payments</p>
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
            <p className="text-2xl font-bold text-white">₹{totalInvested.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Confirmed</p>
              <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
                <CheckCircle size={18} className="text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{successful.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total Transactions</p>
              <div className="w-9 h-9 rounded-lg bg-dark-700 flex items-center justify-center">
                <CreditCard size={18} className="text-gray-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{payments.length}</p>
          </div>
        </div>

        {/* Investment list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-dark-800 rounded-xl animate-pulse border border-dark-500" />)}
          </div>
        ) : payments.length === 0 ? (
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
              {payments.map((payment) => (
                <div key={payment.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {statusIcon(payment.status)}
                    <div>
                      <p className="font-semibold text-gray-100">{payment.startupName}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {payment.razorpayPaymentId && <span className="ml-2 font-mono text-gray-600">{payment.razorpayPaymentId}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-white">₹{Number(payment.amount).toLocaleString()}</p>
                    <span className={statusBadge(payment.status)}>{statusLabel(payment.status)}</span>
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
