/**
 * Currency formatting utilities for INR
 */

export const formatCurrency = (amount: number | string | null | undefined): string => {
  const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  if (isNaN(numAmount)) return '₹0.00';
  return `₹${numAmount.toFixed(2)}`;
};

export const formatCurrencyWithoutSymbol = (amount: number | string | null | undefined): string => {
  const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  if (isNaN(numAmount)) return '0.00';
  return numAmount.toFixed(2);
};

export const getCurrencySymbol = (): string => {
  return '₹';
};

