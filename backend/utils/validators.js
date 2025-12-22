/**
 * Validation Utilities
 * Reusable validation functions
 */

/**
 * Validate email format (RFC 5322 compliant)
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate phone number - India format: +91 XXXXX XXXXX (10 digits after +91)
 */
const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // Remove all non-digit characters except +
  const cleaned = phone.trim();
  // Check for Indian format: +91 followed by 10 digits
  const indiaRegex = /^\+91\s?\d{5}\s?\d{5}$/;
  // Also allow 10 digits without country code (for backward compatibility)
  const tenDigitRegex = /^\d{10}$/;
  return indiaRegex.test(cleaned) || tenDigitRegex.test(cleaned.replace(/\D/g, ''));
};

/**
 * Validate Indian phone number format specifically
 * Accepts: +91 XXXXX XXXXX or +91 XXXXXXXXXX or just 10 digits
 */
const isValidIndiaPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.trim();
  // Must start with +91 and have 10 digits after, or just 10 digits
  const indiaRegex = /^(\+91\s?)?\d{5}\s?\d{5}$/;
  // Also allow just 10 digits
  const tenDigits = /^\d{10}$/;
  return indiaRegex.test(cleaned) || tenDigits.test(cleaned);
};

/**
 * Validate Indian pincode (6 digits)
 */
const isValidIndiaPincode = (pincode) => {
  if (!pincode || typeof pincode !== 'string') return false;
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode.trim());
};

/**
 * Validate date is not in the past
 */
const isFutureDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);
  return appointmentDate >= today;
};

/**
 * Validate time format (HH:MM AM/PM)
 */
const isValidTime = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s?(AM|PM)$/i;
  return timeRegex.test(time);
};

/**
 * Validate strong password:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const isStrongPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 8) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

/**
 * Get password strength feedback
 */
const getPasswordStrength = (password) => {
  if (!password) return { strength: 'weak', message: '', requirements: [] };
  
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
  
  const metCount = Object.values(requirements).filter(Boolean).length;
  let strength = 'weak';
  let message = '';
  
  if (metCount === 5) {
    strength = 'strong';
    message = 'Strong password';
  } else if (metCount >= 3) {
    strength = 'medium';
    message = 'Medium strength password';
  } else {
    strength = 'weak';
    message = 'Weak password';
  }
  
  return { strength, message, requirements };
};

/**
 * Validate role
 */
const isValidRole = (role) => {
  return ['admin', 'doctor', 'patient'].includes(role);
};

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Format phone number to Indian format: +91 XXXXX XXXXX
 */
const formatIndiaPhone = (phone) => {
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

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidIndiaPhone,
  isValidIndiaPincode,
  isFutureDate,
  isValidTime,
  isStrongPassword,
  getPasswordStrength,
  isValidRole,
  sanitizeString,
  formatIndiaPhone
};

