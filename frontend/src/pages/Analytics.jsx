import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
import { formatCurrency } from '../utils/format';

const PIE_COLORS = ['#6c5ce7', '#00b894', '#fdcb6e', '#e17055', '#0984e3', '#e84393', '#00cec9', '#636e72'];

const monthKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`;
const monthLabel = (year, month) =>
  new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/transactions/summary');
      setSummary(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading && !summary) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        Loading analytics...
      </div>
    );
  }

  // Merge monthly trend into { month, Income, Expense }
  const monthMap = {};
  (summary?.monthlyTrend || []).forEach((row) => {
    const key = monthKey(row._id.year, row._id.month);
    if (!monthMap[key]) {
      monthMap[key] = {
        key,
        label: monthLabel(row._id.year, row._id.month),
        Income: 0,
        Expense: 0,
      };
    }
    if (row._id.type === 'income') monthMap[key].Income = row.total;
    if (row._id.type === 'expense') monthMap[key].Expense = row.total;
  });
  const monthlyData = Object.values(monthMap).sort((a, b) => (a.key > b.key ? 1 : -1));

  const pieData = (summary?.categoryBreakdown || []).map((c) => ({
    name: c._id || 'Uncategorized',
    value: c.total,
  }));

  const topCategories = [...(summary?.categoryBreakdown || [])].slice(0, 5);
  const totalExpense = summary?.totalExpense || 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Deeper insight into your spending trends and habits.</p>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <h3>Monthly Income vs Expense Trend</h3>
        </div>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e1d4" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#667169' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#667169' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e2e1d4' }} />
              <Legend />
              <Line type="monotone" dataKey="Income" stroke="#2f7a52" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Expense" stroke="#b8502f" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty">Add transactions across a few months to see trends here</div>
        )}
      </div>

      <div className="panel-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Expense Distribution</h3>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
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

        <div className="panel">
          <div className="panel-header">
            <h3>Top Spending Categories</h3>
          </div>
          {topCategories.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {topCategories.map((c, i) => {
                const pct = totalExpense > 0 ? (c.total / totalExpense) * 100 : 0;
                return (
                  <div key={c._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{c._id || 'Uncategorized'}</span>
                      <span className="mono">{formatCurrency(c.total)}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: 'var(--color-bg)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: PIE_COLORS[i % PIE_COLORS.length],
                          borderRadius: 999,
                          transition: 'width 400ms ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="chart-empty">No expenses recorded yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
