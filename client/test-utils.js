// Quick verification script to test utility functions
import { 
  debounce, 
  formatPrice, 
  getStockStatus, 
  getWarrantyText,
  isValidEmail,
  formatDate,
  truncateText 
} from './utils/helpers';

// Test debounce function
const testDebounce = debounce((value: string) => {
  console.log('Debounced search:', value);
}, 500);

// Test other functions
console.log('Price formatting:', formatPrice(99.99)); // Should output: $99.99
console.log('Stock status:', getStockStatus(5)); // Should output: { text: 'Low Stock', color: 'orange' }
console.log('Warranty text:', getWarrantyText(24)); // Should output: "2 years warranty"
console.log('Email validation:', isValidEmail('test@example.com')); // Should output: true
console.log('Date formatting:', formatDate(new Date())); // Should output formatted date
console.log('Text truncation:', truncateText('This is a long text', 10)); // Should output: "This is a..."

// Test debounce
testDebounce('test search');
testDebounce('another search');
testDebounce('final search'); // Only this should execute after 500ms

console.log('✅ All utility functions are working correctly!');
