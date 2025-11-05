import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { config } from '../config';
import User from '../models/User';
import PasswordResetToken from '../models/PasswordResetToken';
import emailService from '../services/emailService';
import notificationService from '../services/notificationService';
import { handleValidationErrors } from '../middleware/validationHandler';

// Helper function to generate JWT token
const generateToken = (userId: string) => {
  return jwt.sign({ user_id: userId }, config.jwt.secret, {
    expiresIn: '24h',
  });
};

// Helper function to generate password reset token
const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Register user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Hash password with 10 rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password_hash: hashedPassword,
      phone,
      role: 'customer',
    });

    // Generate token
    const token = generateToken(user.user_id);

    // Send welcome email (don't await to avoid blocking response)
    notificationService.sendWelcomeEmail(user.user_id).catch((error: any) => {
      console.error('Failed to send welcome email:', error);
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      },
    });
    return;
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed' 
    });
    return;
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(user.user_id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      },
    });
    return;
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed' 
    });
    return;
  }
};

// Get user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    res.json({
      success: true,
      data: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get profile' 
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, phone } = req.body;

    // Update user
    await user.update({ name, phone });

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to update profile' 
    });
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await PasswordResetToken.create({
      user_id: user.user_id,
      token: resetToken,
      expires_at: expiresAt,
      used: false,
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
    });
    return;
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process password reset request' 
    });
    return;
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    // Find valid reset token
    const resetToken = await PasswordResetToken.findOne({
      where: {
        token,
        used: false,
        expires_at: {
          [require('sequelize').Op.gt]: new Date(),
        },
      },
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Find user
    const user = await User.findByPk(resetToken.user_id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await user.update({ password_hash: hashedPassword });

    // Mark token as used
    await resetToken.update({ used: true });

    // Send confirmation email
    emailService.sendPasswordResetConfirmation(user.email, user.name).catch((error: any) => {
      console.error('Failed to send confirmation email:', error);
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
    return;
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to reset password' 
    });
    return;
  }
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await user.update({ password_hash: hashedPassword });

    // Send confirmation email
    emailService.sendPasswordResetConfirmation(user.email, user.name).catch((error: any) => {
      console.error('Failed to send confirmation email:', error);
    });

    return res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to change password' 
    });
  }
};

// Logout user
export const logout = async (req: Request, res: Response) => {
  try {
    // In a real application, you might want to blacklist the token
    res.json({ 
      success: true,
      message: 'Logout successful' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Logout failed' 
    });
  }
};
