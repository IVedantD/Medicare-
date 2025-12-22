/**
 * India Localization Utilities
 * Date, currency, phone, and address formatting for India
 */

/**
 * Indian States and Union Territories
 */
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

/**
 * Format date to DD-MM-YYYY format (India standard)
 */
export const formatDateIndia = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}-${month}-${year}`;
};

/**
 * Parse DD-MM-YYYY format to Date
 */
export const parseDateIndia = (dateString: string): Date | null => {
  const parts = dateString.split('-');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  
  return date;
};

/**
 * Format currency in Indian Rupees (₹)
 */
export const formatCurrencyINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number with Indian number system (lakhs, crores)
 */
export const formatNumberIndia = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Get current time in India timezone (Asia/Kolkata)
 */
export const getIndiaTime = (): Date => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
};

/**
 * Format date-time in India timezone
 */
export const formatDateTimeIndia = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
};

/**
 * Format phone number to Indian format: +91 XXXXX XXXXX
 */
export const formatPhoneIndia = (phone: string): string => {
  if (!phone) return '';
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // If starts with 91, remove it (country code)
  const cleanDigits = digits.startsWith('91') && digits.length === 12 ? digits.substring(2) : digits;
  // If 10 digits, format as +91 XXXXX XXXXX
  if (cleanDigits.length === 10) {
    return `+91 ${cleanDigits.substring(0, 5)} ${cleanDigits.substring(5)}`;
  }
  return phone; // Return original if can't format
};

/**
 * Default region settings for India
 */
export const INDIA_LOCALE = {
  region: 'India',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  currencySymbol: '₹',
  dateFormat: 'DD-MM-YYYY',
  phoneFormat: '+91 XXXXX XXXXX',
  pincodeFormat: 'XXXXXX',
};

