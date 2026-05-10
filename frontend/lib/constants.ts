export const BUSINESSES = {
  POWER_BRICK: { name: 'POWER BRICK', code: 'POWER_BRICK', icon: '🧱', color: '#f97316' },
  BAKE_LAND: { name: 'BAKE LAND', code: 'BAKE_LAND', icon: '🍞', color: '#a855f7' },
} as const;

export const ROLES = {
  super_admin: { label: 'Super Admin', color: '#ef4444' },
  manager: { label: 'Manager', color: '#f97316' },
  accountant: { label: 'Accountant', color: '#3b82f6' },
  worker_supervisor: { label: 'Worker Supervisor', color: '#22c55e' },
  bakery_staff: { label: 'Bakery Staff', color: '#a855f7' },
  power_brick_staff: { label: 'Power Brick Staff', color: '#f59e0b' },
  staff: { label: 'Staff', color: '#6b7280' },
} as const;

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
];

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'partial', label: 'Partial', color: '#3b82f6' },
  { value: 'paid', label: 'Paid', color: '#22c55e' },
];

export const MATERIAL_CATEGORIES = [
  { value: 'brick', label: 'Bricks' },
  { value: 'aggregate', label: 'Aggregates' },
  { value: 'cement', label: 'Cement' },
  { value: 'other', label: 'Other' },
];

export const MATERIAL_UNITS = [
  { value: 'pieces', label: 'Pieces' },
  { value: 'tons', label: 'Tons' },
  { value: 'bags', label: 'Bags' },
  { value: 'cubic_feet', label: 'Cubic Feet' },
  { value: 'kg', label: 'Kg' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'electricity', label: 'Electricity' },
  { value: 'home', label: 'Home' },
  { value: 'water', label: 'Water' },
  { value: 'personal', label: 'Personal' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'power_brick', label: 'Power Brick' },
  { value: 'miscellaneous', label: 'Miscellaneous' },
  { value: 'unknown', label: 'Unknown' },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  } catch (e) {
    return 'Invalid Date';
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  } catch (e) {
    return 'Invalid Date';
  }
}
