// Utility function for debouncing
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Utility function for throttling
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Format price utility
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
}

// Get stock status utility
export function getStockStatus(stock: number): { text: string; color: string } {
  if (stock === 0) return { text: 'Out of Stock', color: 'red' };
  if (stock < 10) return { text: 'Low Stock', color: 'orange' };
  return { text: 'In Stock', color: 'green' };
}

// Get warranty text utility
export function getWarrantyText(months: number): string {
  if (months >= 12) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years} year${years > 1 ? 's' : ''} warranty`;
    }
    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} warranty`;
  }
  return `${months} months warranty`;
}

// Validate email utility
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate random string utility
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Convert UTC timestamp to IST (Indian Standard Time)
export function toIST(date: string | Date): Date {
  const dateObj = new Date(date);
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  const utc = dateObj.getTime() + (dateObj.getTimezoneOffset() * 60 * 1000);
  return new Date(utc + istOffset);
}

// Format date utility (converts to IST)
export function formatDate(date: string | Date): string {
  const istDate = toIST(date);
  return istDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

// Format date time utility (converts to IST)
export function formatDateTime(date: string | Date): string {
  const istDate = toIST(date);
  return istDate.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

// Format date only utility (IST)
export function formatDateOnly(date: string | Date): string {
  const istDate = toIST(date);
  return istDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
}

// Format time only utility (IST)
export function formatTime(date: string | Date): string {
  const istDate = toIST(date);
  return istDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

// Format relative time utility (e.g., "2 hours ago")
export function formatRelativeTime(date: string | Date): string {
  const istDate = toIST(date);
  const now = toIST(new Date());
  const diffInSeconds = Math.floor((now.getTime() - istDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date);
}

// Truncate text utility
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Capitalize first letter utility
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Convert to slug utility
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}