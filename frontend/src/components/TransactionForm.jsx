import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { CloseIcon } from './Icons';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../utils/categories';

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  type: 'expense',
  category: '',
  amount: '',
  description: '',
  date: todayISO(),
  paymentMethod: 'card',
};

const TransactionForm = ({ transaction, defaultType, onClose, onSaved }) => {
  const isEdit = Boolean(transaction);
  const [form, setForm] = useState(
    transaction
      ? {
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          description: transaction.description || '',
          date: new Date(transaction.date).toISOString().slice(0, 10),
          paymentMethod: transaction.paymentMethod || 'other',
        }
      : { ...emptyForm, type: defaultType || 'expense' }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset category if it no longer fits the selected type's list
    const list = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (form.category && !list.find((c) => c.name === form.category)) {
      setForm((f) => ({ ...f, category: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.type]);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.category) return setError('Please select a category');
    if (!form.amount || Number(form.amount) <= 0) return setError('Amount must be greater than 0');

    const payload = {
      type: form.type,
      category: form.category,
      amount: Number(form.amount),
      description: form.description,
      date: form.date,
      paymentMethod: form.paymentMethod,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/transactions/${transaction._id}`, payload);
        toast.success('Transaction updated');
      } else {
        await api.post('/transactions', payload);
        toast.success(`${form.type === 'income' ? 'Income' : 'Expense'} added`);
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="type-toggle">
            <button
              type="button"
              className={`${form.type === 'expense' ? 'active expense' : ''}`}
              onClick={() => setForm((f) => ({ ...f, type: 'expense' }))}
            >
              Expense
            </button>
            <button
              type="button"
              className={`${form.type === 'income' ? 'active income' : ''}`}
              onClick={() => setForm((f) => ({ ...f, type: 'income' }))}
            >
              Income
            </button>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={form.category} onChange={handleChange}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="amount">Amount ($)</label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="date">Date</label>
              <input id="date" name="date" type="date" value={form.date} onChange={handleChange} max={todayISO()} />
            </div>
            <div className="form-field">
              <label htmlFor="paymentMethod">Payment Method</label>
              <select id="paymentMethod" name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
                {PAYMENT_METHODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              name="description"
              rows={2}
              placeholder="Add a note..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
