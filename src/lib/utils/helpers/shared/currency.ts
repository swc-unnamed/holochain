
export const toLocalCurrency = (
  amount: string | number,
) => {
  const value = typeof amount === 'string' ? Number(amount) : amount;

  if (Number.isNaN(value)) {
    return String(amount ?? '');
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0,
      useGrouping: true
    }).format(value);
  } catch (error) {
    console.error('currency format error', error);
    return value.toString();
  }
};

export const toAbbrCurrency = (amount: string | number) => {
  const value = typeof amount === 'string' ? Number(amount) : amount;

  if (!Number.isFinite(value)) {
    return String(amount ?? '');
  }

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  }

  if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }

  if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }

  return `${absValue}${sign}`;
};