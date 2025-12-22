/**
 * Validation Utilities
 * Reusable validation functions
 */

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic)
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
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
 * Validate password strength
 */
const isStrongPassword = (password) => {
  // At least 6 characters (can be enhanced)
  return password && password.length >= 6;
};

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isFutureDate,
  isValidTime,
  isStrongPassword,
  sanitizeString
};

