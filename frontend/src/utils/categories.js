// Category presets with emoji icons — used across forms, lists, and charts
export const EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍔' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Transport', icon: '🚗' },
  { name: 'Electricity Bill', icon: '💡' },
  { name: 'Rent', icon: '🏠' },
  { name: 'Loan Repayment', icon: '🏦' },
  { name: 'Healthcare', icon: '🏥' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Education', icon: '📚' },
  { name: 'Groceries', icon: '🛒' },
  { name: 'Subscriptions', icon: '🔁' },
  { name: 'Other', icon: '🧾' },
];

export const INCOME_CATEGORIES = [
  { name: 'Salary', icon: '💼' },
  { name: 'Freelance', icon: '💻' },
  { name: 'Business', icon: '🏢' },
  { name: 'Investment', icon: '📈' },
  { name: 'Gift', icon: '🎁' },
  { name: 'Refund', icon: '↩️' },
  { name: 'Other', icon: '💰' },
];

export const getCategoryIcon = (category, type) => {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const match = list.find((c) => c.name.toLowerCase() === (category || '').toLowerCase());
  return match ? match.icon : type === 'income' ? '💰' : '🧾';
};

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'other', label: 'Other' },
];
