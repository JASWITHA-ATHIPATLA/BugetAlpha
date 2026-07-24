import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import TransactionTable from './TransactionTable';
import TransactionForm from './TransactionForm';
import ConfirmDialog from './ConfirmDialog';
import { SearchIcon, PlusIcon, DownloadIcon } from './Icons';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';

const LIMIT = 10;

const TransactionsPageBase = ({ type, title, subtitle }) => {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deletingTx, setDeletingTx] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/transactions', {
        params: {
          type,
          search: search || undefined,
          category: category || undefined,
          sortBy,
          order,
          page,
          limit: LIMIT,
        },
      });
      setTransactions(data.transactions);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [type, search, category, sortBy, order, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, sortBy, order]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder('desc');
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingTx(null);
    fetchTransactions();
  };

  const handleDelete = async () => {
    if (!deletingTx) return;
    setDeleting(true);
    try {
      await api.delete(`/transactions/${deletingTx._id}`);
      toast.success('Transaction deleted');
      setDeletingTx(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete transaction');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    const loadingId = toast.loading('Preparing Excel file...');
    try {
      const response = await api.get('/transactions/export', {
        params: { type, category: category || undefined },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-transactions.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel file downloaded', { id: loadingId });
    } catch (err) {
      toast.error('Failed to export transactions', { id: loadingId });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-outline" onClick={handleExport} disabled={exporting}>
            <DownloadIcon /> Export
          </button>
          <button type="button" className="btn btn-accent" onClick={() => setShowForm(true)}>
            <PlusIcon /> Add {type === 'income' ? 'Income' : 'Expense'}
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by category or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="data-card">
        <TransactionTable
          transactions={transactions}
          loading={loading}
          sortBy={sortBy}
          order={order}
          onSort={handleSort}
          onEdit={(t) => setEditingTx(t)}
          onDelete={(t) => setDeletingTx(t)}
        />
        {!loading && transactions.length > 0 && (
          <div className="pagination">
            <span>
              {total} total {type === 'income' ? 'income entries' : 'expenses'}
            </span>
            <div className="pagination-controls">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </button>
              <span style={{ padding: '7px 4px' }}>
                Page {page} of {pages}
              </span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {(showForm || editingTx) && (
        <TransactionForm
          transaction={editingTx}
          defaultType={type}
          onClose={() => {
            setShowForm(false);
            setEditingTx(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {deletingTx && (
        <ConfirmDialog
          title="Delete transaction?"
          message={`This will permanently delete the ${deletingTx.category} entry of ${deletingTx.amount ? '$' + deletingTx.amount : ''}.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingTx(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default TransactionsPageBase;
