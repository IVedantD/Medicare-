const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { isValidEmail, isStrongPassword, isValidRole, isValidIndiaPhone, isValidIndiaPincode, normalizePhoneNumber } = require('../utils/validators');
const { sendNotification } = require('../services/whatsapp.service');

/**
 * Register New User
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('[REGISTER] MongoDB not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please ensure MongoDB is running and restart the server.'
      });
    }

    const { name, email, password, role, phone, specialization } = req.body;

    // Validation - Required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate role
    if (!isValidRole(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be admin, doctor, or patient'
      });
    }

    // Validate strong password
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
      });
    }

    // Validate phone format if provided (India format) - make it more lenient
    if (phone && phone.trim() !== '') {
      // Allow empty phone, but if provided, validate format
      if (!isValidIndiaPhone(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must be in format: +91 XXXXX XXXXX or 10 digits'
        });
      }
    }

    // Validate pincode format if provided (India format - 6 digits)
    if (req.body.address?.pincode && !isValidIndiaPincode(req.body.address.pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Pincode must be 6 digits'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please use a different email.'
      });
    }

    // Check if phone number already exists (if provided)
    if (phone && phone.trim() !== '') {
      const normalizedPhone = normalizePhoneNumber(phone);
      const existingPhoneUser = await User.findOne({ 
        phone: { $regex: new RegExp(normalizedPhone.replace(/[+]/g, '\\+'), 'i') }
      });
      
      if (existingPhoneUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already registered. Please use a different phone number.'
        });
      }
    }

    // For doctors, specialization is required
    if (role === 'doctor' && !specialization) {
      return res.status(400).json({
        success: false,
        message: 'Specialization is required for doctors'
      });
    }

    // Create user
    console.log('[REGISTER] Creating user with data:', {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role,
      phone: phone || '(empty)',
      hasPassword: !!password,
      passwordLength: password?.length
    });

    // Format phone number to standard format
    let formattedPhone = '';
    if (phone && phone.trim() !== '') {
      const normalized = normalizePhoneNumber(phone);
      formattedPhone = normalized.startsWith('+91') ? normalized : `+91${normalized.replace(/^\+?91?/, '')}`;
    }

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      phone: formattedPhone,
      whatsappNotificationsEnabled: req.body.whatsappNotificationsEnabled !== false, // Default to true
      specialization: role === 'doctor' ? specialization : '',
      verified: role === 'doctor' ? false : true, // Doctors need admin verification
      // India-specific address fields
      address: {
        street: req.body.address?.street || '',
        city: req.body.address?.city || '',
        state: req.body.address?.state || '',
        pincode: req.body.address?.pincode || ''
      }
    };

    console.log('[REGISTER] Attempting to create user in database...');
    console.log('[REGISTER] User data to save:', {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      hasPassword: !!userData.password,
      phone: userData.phone || '(empty)',
      hasAddress: !!userData.address
    });
    
    const user = await User.create(userData);
    
    console.log('[REGISTER] ✅ User created successfully in MongoDB!');
    console.log('[REGISTER] User ID:', user._id);
    console.log('[REGISTER] User email:', user.email);
    console.log('[REGISTER] User role:', user.role);
    console.log('[REGISTER] User saved to database: medicare.users collection');

    // Generate token
    const token = generateToken(user._id);

    // Update last login using findByIdAndUpdate to avoid triggering pre-save hook
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Send WhatsApp registration notification (non-blocking)
    if (user.phone && user.whatsappNotificationsEnabled) {
      sendNotification('registration', user.phone, [user.name, user.role], {
        disabled: !user.whatsappNotificationsEnabled
      }).catch(err => {
        console.error('[REGISTER] WhatsApp notification error (non-blocking):', err.message);
      });
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        whatsappNotificationsEnabled: user.whatsappNotificationsEnabled,
        specialization: user.specialization,
        department: user.department,
        verified: user.verified,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('[REGISTER] ❌ Registration error:', error);
    console.error('[REGISTER] Error name:', error.name);
    console.error('[REGISTER] Error message:', error.message);
    console.error('[REGISTER] Error code:', error.code);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('[REGISTER] Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Handle duplicate email error
    if (error.code === 11000 || error.code === 11001) {
      console.error('[REGISTER] Duplicate email error');
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Handle other errors
    console.error('[REGISTER] Full error stack:', error.stack);
    
    // Check if MongoDB connection issue
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('[REGISTER] MongoDB not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please ensure MongoDB is running and restart the server.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    // Handle Mongoose connection errors
    if (error.name === 'MongooseError' || error.message.includes('buffering timed out')) {
      return res.status(503).json({
        success: false,
        message: 'Database connection error. Please ensure MongoDB is running.'
      });
    }

    // Provide helpful error message based on error type
    let userFriendlyMessage = 'Registration failed. Please try again.';
    
    // Check error message for specific issues
    if (error.message && typeof error.message === 'string') {
      const msg = error.message.toLowerCase();
      if (msg.includes('password')) {
        userFriendlyMessage = 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.';
      } else if (msg.includes('phone')) {
        userFriendlyMessage = 'Phone number format is invalid. Use +91 XXXXX XXXXX format or leave empty.';
      } else if (msg.includes('email')) {
        userFriendlyMessage = 'Email validation failed. Please check your email format.';
      } else if (msg.includes('validation')) {
        userFriendlyMessage = `Validation error: ${error.message}`;
      } else {
        // In development, show actual error
        if (process.env.NODE_ENV === 'development') {
          userFriendlyMessage = `Registration failed: ${error.message}`;
        }
      }
    }

    res.status(500).json({
      success: false,
      message: userFriendlyMessage,
      error: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message,
        code: error.code
      } : undefined
    });
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('[LOGIN] MongoDB not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please ensure MongoDB is running and restart the server.'
      });
    }

    const { email, password } = req.body;

    // Validation - Required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      console.log(`Login attempt failed: User not found for email: ${email.toLowerCase()}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log(`Login attempt failed: Account inactive for email: ${email.toLowerCase()}`);
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // Compare password
    console.log(`[LOGIN DEBUG] Attempting login for: ${email.toLowerCase()}`);
    console.log(`[LOGIN DEBUG] User found: ${user.email}, Role: ${user.role}, Active: ${user.isActive}`);
    console.log(`[LOGIN DEBUG] Password hash exists: ${!!user.password}`);
    console.log(`[LOGIN DEBUG] Password hash length: ${user.password ? user.password.length : 0}`);
    
    const isPasswordValid = await user.comparePassword(password);
    
    console.log(`[LOGIN DEBUG] Password comparison result: ${isPasswordValid}`);

    if (!isPasswordValid) {
      console.log(`[LOGIN DEBUG] Login failed: Invalid password for email: ${email.toLowerCase()}`);
      // Additional debugging: test direct bcrypt comparison
      try {
        const bcrypt = require('bcryptjs');
        const directCompare = await bcrypt.compare(password, user.password);
        console.log(`[LOGIN DEBUG] Direct bcrypt.compare result: ${directCompare}`);
        if (directCompare !== isPasswordValid) {
          console.log(`[LOGIN DEBUG] WARNING: comparePassword method differs from direct bcrypt.compare!`);
        }
      } catch (bcryptError) {
        console.log(`[LOGIN DEBUG] Direct bcrypt comparison error: ${bcryptError.message}`);
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    console.log(`[LOGIN DEBUG] Login successful for: ${email.toLowerCase()}`);

    // Generate token
    const token = generateToken(user._id);

    // Update last login using findByIdAndUpdate to avoid triggering pre-save hook
    // This prevents any potential password re-hashing issues
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Send WhatsApp login alert (optional, non-blocking)
    // Only send if enabled in environment and user has phone number
    if (process.env.ENABLE_LOGIN_WHATSAPP_ALERTS === 'true' && user.phone && user.whatsappNotificationsEnabled) {
      sendNotification('loginAlert', user.phone, [user.name, new Date()], {
        disabled: !user.whatsappNotificationsEnabled
      }).catch(err => {
        console.error('[LOGIN] WhatsApp notification error (non-blocking):', err.message);
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        whatsappNotificationsEnabled: user.whatsappNotificationsEnabled,
        specialization: user.specialization,
        department: user.department,
        verified: user.verified,
        avatar: user.avatar,
        experience: user.experience,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

/**
 * Get User Profile
 * GET /api/auth/profile
 * Requires authentication
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        whatsappNotificationsEnabled: user.whatsappNotificationsEnabled,
        specialization: user.specialization,
        department: user.department,
        verified: user.verified,
        avatar: user.avatar,
        experience: user.experience,
        bio: user.bio,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

/**
 * Update User Profile
 * PUT /api/auth/profile
 * Requires authentication
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, specialization, department, experience, bio, whatsappNotificationsEnabled } = req.body;

    const updateData = {};
    
    if (name) updateData.name = name.trim();
    if (phone !== undefined) {
      // Format phone number if provided
      if (phone && phone.trim() !== '') {
        const normalized = normalizePhoneNumber(phone);
        updateData.phone = normalized.startsWith('+91') ? normalized : `+91${normalized.replace(/^\+?91?/, '')}`;
      } else {
        updateData.phone = '';
      }
    }
    if (avatar !== undefined) updateData.avatar = avatar;
    if (whatsappNotificationsEnabled !== undefined) updateData.whatsappNotificationsEnabled = whatsappNotificationsEnabled;
    
    // Doctor-specific fields
    if (req.user.role === 'doctor') {
      if (specialization) updateData.specialization = specialization;
      if (department) updateData.department = department;
      if (experience) updateData.experience = experience;
      if (bio) updateData.bio = bio;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        whatsappNotificationsEnabled: user.whatsappNotificationsEnabled,
        specialization: user.specialization,
        department: user.department,
        verified: user.verified,
        avatar: user.avatar,
        experience: user.experience,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * Logout User
 * POST /api/auth/logout
 * Note: With JWT, logout is handled client-side by removing token
 * This endpoint is for consistency and can log the logout event
 */
const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can log the event or update last activity
    if (req.user) {
      // Could update last activity timestamp here if needed
      // await User.findByIdAndUpdate(req.user.id, { lastActivity: new Date() });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

/**
 * Change User Password
 * POST /api/auth/change-password
 * Requires authentication
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation - Required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    // Validate new password strength
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
      });
    }

    // Check if new password is different from current password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Find user and include password for comparison
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log(`[CHANGE_PASSWORD] Password changed successfully for user: ${user.email}`);

    // Send WhatsApp notification about password change (non-blocking)
    if (user.phone && user.whatsappNotificationsEnabled) {
      sendNotification('passwordChanged', user.phone, [user.name, new Date()], {
        disabled: !user.whatsappNotificationsEnabled
      }).catch(err => {
        console.error('[CHANGE_PASSWORD] WhatsApp notification error (non-blocking):', err.message);
      });
    }

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to change password. Please try again.'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  changePassword
};

