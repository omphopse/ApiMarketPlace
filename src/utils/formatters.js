import dayjs from 'dayjs';

export const formatCurrency = (value, currency = '₹') => `${currency}${Number(value || 0).toLocaleString('en-IN')}`;

export const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN');

export const formatCompactNumber = (value) => {
  const abs = Math.abs(Number(value || 0));
  if (abs >= 1000000) return `${(abs / 1000000).toFixed(abs % 1000000 === 0 ? 0 : 1)}M`;
  if (abs >= 1000) return `${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}K`;
  return formatNumber(abs);
};

export const formatDate = (value) => dayjs(value).isValid() ? dayjs(value).format('D MMM YYYY') : value;
export const formatRelativeTime = (value) => dayjs(value).fromNow();
