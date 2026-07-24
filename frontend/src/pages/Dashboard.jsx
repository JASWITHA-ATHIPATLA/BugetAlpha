import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../api/axios';
import SummaryCard from '../components/SummaryCard';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import { WalletIcon, TrendUpIcon, TrendDownIcon, PlusIcon } from '../components/Icons';
import { formatCurrency } from '../utils/format';

const PIE_COLORS = ['#6c5ce7', '#00b894', '#fdcb6e', '#e17055', '#0984e3', '#e84393', '#00cec9', '#636e72'];

const monthLabel = (year, month) =>
  new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short' });

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [last30, setLast30] = useState([]);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/transactions/summary');
      setSummary(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLast30 = useCallback(async () => {
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);

      const { data } = await api.get('/transactions', {
        params: {
          type: 'expense',
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
          sortBy: 'date',
          order: 'asc',
          limit: 100,
        },
      });

      // Bucket into 6 five-day windows for a readable bar chart
      const buckets = [];
      for (let i = 0; i < 6; i++) {
        const bucketStart = new Date(start);
        bucketStart.setDate(start.getDate() + i * 5);
        const bucketEnd = new Date(bucketStart);
        bucketEnd.setDate(bucketStart.getDate() + 4);
        buckets.push({
          label: `${bucketStart.getDate()}/${bucketStart.getMonth() + 1}`,
          start: bucketStart,
          end: bucketEnd,
          total: 0,
        });
      }
      data.transactions.forEach((t) => {
        const d = new Date(t.date);
        const bucket = buckets.find((b) => d >= b.start && d <= b.end);
        if (bucket) bucket.total += t.amount;
      });
      setLast30(buckets.map((b) => ({ label: b.label, total: Math.round(b.total * 100) / 100 })));
    } catch (err) {
      // Non-critical chart — fail silently, dashboard still usable
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchLast30();
  }, [fetchSummary, fetchLast30]);

  const handleSaved = () => {
    setShowForm(false);
    fetchSummary();
    fetchLast30();
    toast.success('Dashboard updated');
  };

  if (loading && !summary) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        Loading dashboard...
      </div>
    );
  }

  const barData = [
    { name: 'This Period', Income: summary?.totalIncome || 0, Expense: summary?.totalExpense || 0 },
  ];

  const pieData = (summary?.categoryBreakdown || []).map((c) => ({
    name: c._id || 'Uncategorized',
    value: c.total,
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Here's an overview of your finances.</p>
        </div>
        <button type="button" className="btn btn-accent" onClick={() => setShowForm(true)}>
          <PlusIcon /> Add Transaction
        </button>
      </div>

      <div className="summary-grid">
        <SummaryCard
          label="Total Balance"
          amount={formatCurrency(summary?.balance)}
          icon={WalletIcon}
          tone="balance"
        />
        <SummaryCard
          label="Total Income"
          amount={formatCurrency(summary?.totalIncome)}
          icon={TrendUpIcon}
          tone="income"
        />
        <SummaryCard
          label="Total Expense"
          amount={formatCurrency(summary?.totalExpense)}
          icon={TrendDownIcon}
          tone="expense"
        />
      </div>

      <div className="panel-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Income vs Expense</h3>
          </div>
          {summary?.totalIncome || summary?.totalExpense ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} barGap={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e1d4" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#667169' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#667169' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e2e1d4' }} />
                <Legend />
                <Bar dataKey="Income" fill="#2f7a52" radius={[6, 6, 0, 0]} maxBarSize={60} />
                <Bar dataKey="Expense" fill="#b8502f" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Add a transaction to see this chart</div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Expense by Category</h3>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e2e1d4' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No expenses recorded yet</div>
          )}
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Last 30 Days Expenses</h3>
          </div>
          {last30.some((b) => b.total > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={last30}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e1d4" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#667169' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#667169' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e2e1d4' }} />
                <Bar dataKey="total" fill="#a29bfe" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No expenses in the last 30 days</div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Recent Transactions</h3>
            <Link to="/expense" className="panel-link">
              See All →
            </Link>
          </div>
          <TransactionList transactions={summary?.recentTransactions} />
        </div>
      </div>

      {showForm && <TransactionForm onClose={() => setShowForm(false)} onSaved={handleSaved} />}
    </div>
  );
};

export default Dashboard;
