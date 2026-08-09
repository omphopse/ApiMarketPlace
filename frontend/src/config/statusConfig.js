export const statusConfig = {
  DRAFT: { label: 'Draft', color: 'default', description: 'Work in progress' },
  PENDING: { label: 'Pending', color: 'warning', description: 'Awaiting administrator review' },
  APPROVED: { label: 'Approved', color: 'success', description: 'Published and live' },
  REJECTED: { label: 'Rejected', color: 'error', description: 'Needs changes' },
  ARCHIVED: { label: 'Archived', color: 'default', description: 'Paused and hidden from active views' },
  ACTIVE: { label: 'Active', color: 'success', description: 'Live and accessible to consumers' },
  INACTIVE: { label: 'Inactive', color: 'default', description: 'Unavailable for purchase' }
};

export const statusOptions = ['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED'];
export const categoryOptions = ['AI', 'Finance', 'Crypto', 'Weather', 'Maps', 'Payments', 'Messaging', 'Developer Tools', 'Storage', 'Authentication', 'Education', 'Travel', 'News'];
