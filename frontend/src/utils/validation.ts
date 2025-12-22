/**
 * Frontend Validation Utilities
 * Real-time form validation for React components
 */

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate strong password
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (!hasUpperCase) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!hasLowerCase) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!hasNumber) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!hasSpecialChar) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  return { isValid: true, message: '' };
};

/**
 * Get password strength indicator
 */
export const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong'; requirements: { met: boolean; label: string }[] } => {
  const requirements = [
    { met: password.length >= 8, label: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), label: 'One uppercase letter' },
    { met: /[a-z]/.test(password), label: 'One lowercase letter' },
    { met: /[0-9]/.test(password), label: 'One number' },
    { met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), label: 'One special character' },
  ];
  
  const metCount = requirements.filter(r => r.met).length;
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (metCount === 5) strength = 'strong';
  else if (metCount >= 3) strength = 'medium';
  
  return { strength, requirements };
};

/**
 * Validate Indian phone number format: +91 XXXXX XXXXX
 */
export const validateIndiaPhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: true, message: '' }; // Phone is optional
  }
  const cleaned = phone.trim();
  const indiaRegex = /^\+91\s?\d{5}\s?\d{5}$/;
  if (!indiaRegex.test(cleaned)) {
    return { isValid: false, message: 'Phone must be in format: +91 XXXXX XXXXX' };
  }
  return { isValid: true, message: '' };
};

/**
 * Format phone number to Indian format
 */
export const formatIndiaPhone = (phone: string): string => {
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
 * Validate Indian pincode (6 digits)
 */
export const validateIndiaPincode = (pincode: string): ValidationResult => {
  if (!pincode) {
    return { isValid: true, message: '' }; // Pincode is optional
  }
  const pincodeRegex = /^\d{6}$/;
  if (!pincodeRegex.test(pincode.trim())) {
    return { isValid: false, message: 'Pincode must be 6 digits' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate name
 */
export const validateName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, message: 'Name is required' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirm = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }
  return { isValid: true, message: '' };
};

