export const formatINR = (amount) => {
  const numericVal = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(numericVal)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericVal);
};
