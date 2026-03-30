import { useCallback, useEffect, useState } from 'react';
import { DollarSign, CheckCircle, XCircle, Clock, Rocket, TrendingUp, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import useAuth from '../../hooks/useAuth';
import { getPaymentsByFounder, acceptPayment, rejectPayment } from '../../api/paymentApi';

const FounderInvestments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(() => {
    if (!user?.userId) return;
    setLoading(true);
    getPaymentsByFounder(user.userId)
      .then(res => setPayments(res.data || []))
      .catch(() => toast.error('Failed to load investment requests'))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (paymentId) => {
    setActionLoading(paymentId + '_accept');
    try {
      await acceptPayment(paymentId);
      toast.success('Investment accepted! Investor has been notified.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (paymentId) => {
    setActionLoading(paymentId + '_reject');
    try {
      await rejectPayment(paymentId);
      toast.success('Investment rejected. Refund has been initiated to the investor.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const pending = payments.filter(p => p.status === 'AWAITING_APPROVAL');
  const confirmed = payments.filter(p => p.status === 'SUCCESS');
  const rejected = payments.filter(p => p.status === 'REJECTED');
  const totalReceived = confirmed.reduce((sum, p) => sum + Number(p.amount), 0);
  const uniqueInvestors = new Set(confirmed.map(p => p.investorId)).size;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Investment Requests</h1>
          <p className="text-gray-400 text-sm mt-1">Review and accept investor payments for your startups</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total Received</p>
              <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
                <TrendingUp size={18} className="text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-400">₹{totalReceived.toLocaleString()}</p>
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
              <p className="text-gray-400 text-sm">Investors</p>
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <Users size={18} className="text-accent-light" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{uniqueInvestors}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-dark-800 rounded-xl animate-pulse border border-dark-500" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="card text-center py-14">
            <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
              <Rocket size={24} className="text-gray-500" />
            </div>
            <p className="text-gray-300 font-medium">No investment requests yet</p>
            <p className="text-gray-500 text-sm mt-1">Investors will appear here once they pay via Razorpay</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Pending — needs founder action */}
            {pending.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock size={14} /> Awaiting Your Review ({pending.length})
                </h2>
                <div className="space-y-3">
                  {pending.map(payment => (
                    <div key={payment.id} className="card border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                            <DollarSign size={18} className="text-yellow-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{payment.startupName}</p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {payment.investorName} · {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                            {payment.razorpayPaymentId && (
                              <p className="text-xs text-gray-600 font-mono mt-0.5">{payment.razorpayPaymentId}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <p className="text-xl font-bold text-white">₹{Number(payment.amount).toLocaleString()}</p>
                          <button
                            onClick={() => handleAccept(payment.id)}
                            disabled={!!actionLoading}
                            className="btn-success flex items-center gap-1.5 text-sm py-1.5 px-4"
                          >
                            <CheckCircle size={14} />
                            {actionLoading === payment.id + '_accept' ? 'Accepting...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleReject(payment.id)}
                            disabled={!!actionLoading}
                            className="btn-danger flex items-center gap-1.5 text-sm py-1.5 px-4"
                          >
                            <XCircle size={14} />
                            {actionLoading === payment.id + '_reject' ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed */}
            {confirmed.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle size={14} /> Accepted Investments ({confirmed.length})
                </h2>
                <div className="card divide-y divide-dark-500">
                  {confirmed.map(payment => (
                    <div key={payment.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle size={16} className="text-green-400" />
                        <div>
                          <p className="font-medium text-gray-200">{payment.startupName}</p>
                          <p className="text-gray-500 text-xs">
                            {payment.investorName} · {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-green-400">+₹{Number(payment.amount).toLocaleString()}</p>
                        <span className="badge-green">ACCEPTED</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejected */}
            {rejected.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <XCircle size={14} /> Rejected ({rejected.length})
                </h2>
                <div className="card divide-y divide-dark-500">
                  {rejected.map(payment => (
                    <div key={payment.id} className="py-4 flex items-center justify-between gap-4 opacity-60">
                      <div className="flex items-center gap-3">
                        <XCircle size={16} className="text-red-400" />
                        <div>
                          <p className="font-medium text-gray-400">{payment.startupName}</p>
                          <p className="text-gray-600 text-xs">
                            {payment.investorName} · {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-gray-500">₹{Number(payment.amount).toLocaleString()}</p>
                        <span className="badge-red">REJECTED</span>
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
