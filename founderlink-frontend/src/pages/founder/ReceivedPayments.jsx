import { useEffect, useState } from 'react';
import { IndianRupee, TrendingUp, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import useAuth from '../../hooks/useAuth';
import { getPaymentsByFounder } from '../../api/paymentApi';

const ReceivedPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      getPaymentsByFounder(user.id)
        .then(res => setPayments(res.data || []))
        .catch(() => toast.error('Failed to load payments'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const totalReceived = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const uniqueInvestors = new Set(payments.filter(p => p.status === 'SUCCESS').map(p => p.investorId)).size;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Received Investments</h1>
          <p className="text-gray-500 text-sm mt-1">Payments received from investors</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-2xl font-bold text-green-400">₹{totalReceived.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Total Received</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-white">{uniqueInvestors}</p>
            <p className="text-xs text-gray-500 mt-1">Investors</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-accent-light">{payments.filter(p => p.status === 'SUCCESS').length}</p>
            <p className="text-xs text-gray-500 mt-1">Transactions</p>
          </div>
        </div>

        {/* Payments list */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <IndianRupee size={16} className="text-green-400" /> Investment Transactions
          </h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No investments received yet</p>
          ) : (
            <div className="divide-y divide-dark-500">
              {payments.map((payment) => (
                <div key={payment.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center">
                      <TrendingUp size={16} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{payment.investorName}</p>
                      <p className="text-xs text-gray-500">{payment.startupName}</p>
                      <p className="text-xs text-gray-600">{new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">+₹{Number(payment.amount).toLocaleString()}</p>
                    <span className={payment.status === 'SUCCESS' ? 'badge-green' : 'badge-yellow'}>{payment.status}</span>
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

export default ReceivedPayments;
