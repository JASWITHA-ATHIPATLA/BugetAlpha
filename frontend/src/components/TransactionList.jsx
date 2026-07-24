import { getCategoryIcon } from '../utils/categories';
import { formatCurrency, formatDate } from '../utils/format';

const TransactionList = ({ transactions, emptyText = 'No transactions yet' }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="chart-empty">{emptyText}</div>;
  }

  return (
    <div className="tx-list">
      {transactions.map((t) => (
        <div className="tx-row" key={t._id}>
          <div className="tx-row-left">
            <div className="tx-icon">{getCategoryIcon(t.category, t.type)}</div>
            <div className="tx-info">
              <div className="tx-category">{t.category}</div>
              <div className="tx-date">{formatDate(t.date)}</div>
            </div>
          </div>
          <span className={`tx-amount ${t.type}`}>
            {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
