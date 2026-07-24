import { getCategoryIcon } from '../utils/categories';
import { formatCurrency, formatDate } from '../utils/format';
import { EditIcon, TrashIcon } from './Icons';

const TransactionTable = ({ transactions, loading, sortBy, order, onSort, onEdit, onDelete }) => {
  const renderSortArrow = (field) => {
    if (sortBy !== field) return null;
    return <span> {order === 'asc' ? '↑' : '↓'}</span>;
  };

  if (loading) {
    return (
      <div className="page-loading" style={{ minHeight: '200px' }}>
        <div className="spinner" />
        Loading transactions...
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="empty-state">
        <h3>No transactions found</h3>
        <p>Try adjusting your filters, or add a new transaction to get started.</p>
      </div>
    );
  }

  return (
    <table className="tx-table">
      <thead>
        <tr>
          <th onClick={() => onSort('date')}>Date{renderSortArrow('date')}</th>
          <th onClick={() => onSort('category')}>Category{renderSortArrow('category')}</th>
          <th>Description</th>
          <th>Payment</th>
          <th onClick={() => onSort('amount')}>Amount{renderSortArrow('amount')}</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <tr key={t._id}>
            <td>{formatDate(t.date)}</td>
            <td>
              <span className={`badge ${t.type}`}>
                {getCategoryIcon(t.category, t.type)} {t.category}
              </span>
            </td>
            <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t.description || '—'}
            </td>
            <td style={{ textTransform: 'capitalize' }}>{(t.paymentMethod || 'other').replace('_', ' ')}</td>
            <td>
              <span className={`tx-amount ${t.type}`}>
                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
              </span>
            </td>
            <td>
              <div className="tx-actions">
                <button type="button" className="icon-btn" onClick={() => onEdit(t)} aria-label="Edit" title="Edit">
                  <EditIcon />
                </button>
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() => onDelete(t)}
                  aria-label="Delete"
                  title="Delete"
                >
                  <TrashIcon />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TransactionTable;
