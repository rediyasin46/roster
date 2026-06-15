import express from 'express';
import { verifyToken } from './auth.js';
import mysql from 'mysql2/promise';

const router = express.Router();
let pool;

export function initializeProfileRoutes(dbPool) {
  pool = dbPool;
  return router;
}

// ============================================
// GET USER PROFILE
// ============================================
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const conn = await pool.getConnection();

    try {
      const [userResults] = await conn.execute(
        `SELECT u.id, u.uuid, u.username, u.email, u.full_name, u.phone,
                u.national_id, u.user_type, u.status, u.email_verified,
                u.phone_verified, u.created_at, u.last_login,
                p.school_name, p.school_address, p.school_phone, p.school_email,
                p.school_reg_number, p.city, p.region, p.country, p.bio,
                p.avatar_url, p.language, p.timezone, p.notification_preferences
         FROM users u
         LEFT JOIN user_profiles p ON u.id = p.user_id
         WHERE u.id = ?`,
        [userId]
      );

      if (userResults.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userResults[0];
      conn.release();

      res.json({
        success: true,
        user: {
          id: user.id,
          uuid: user.uuid,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          national_id: user.national_id,
          user_type: user.user_type,
          status: user.status,
          email_verified: user.email_verified,
          phone_verified: user.phone_verified,
          created_at: user.created_at,
          last_login: user.last_login,
          profile: {
            school_name: user.school_name,
            school_address: user.school_address,
            school_phone: user.school_phone,
            school_email: user.school_email,
            school_reg_number: user.school_reg_number,
            city: user.city,
            region: user.region,
            country: user.country,
            bio: user.bio,
            avatar_url: user.avatar_url,
            language: user.language,
            timezone: user.timezone,
            notification_preferences: user.notification_preferences ? JSON.parse(user.notification_preferences) : {},
          },
        },
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// UPDATE USER PROFILE
// ============================================
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      email,
      phone,
      school_name,
      school_address,
      school_phone,
      school_email,
      school_reg_number,
      city,
      region,
      country,
      bio,
      avatar_url,
      language,
      timezone,
      notification_preferences,
    } = req.body;

    // Validate input
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone format' });
    }

    const conn = await pool.getConnection();

    try {
      // Update user record
      const updateUserQuery = `
        UPDATE users SET
        ${email ? 'email = ?,' : ''}
        ${phone ? 'phone = ?,' : ''}
        updated_at = NOW()
        WHERE id = ?
      `;

      const userParams = [
        ...(email ? [email] : []),
        ...(phone ? [phone] : []),
        userId,
      ];

      await conn.execute(updateUserQuery, userParams);

      // Update or insert profile
      const [profileResults] = await conn.execute(
        'SELECT id FROM user_profiles WHERE user_id = ?',
        [userId]
      );

      if (profileResults.length === 0) {
        // Insert new profile
        await conn.execute(
          `INSERT INTO user_profiles (
            user_id, school_name, school_address, school_phone, school_email,
            school_reg_number, city, region, country, bio, avatar_url,
            language, timezone, notification_preferences
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            school_name || null,
            school_address || null,
            school_phone || null,
            school_email || null,
            school_reg_number || null,
            city || null,
            region || null,
            country || 'Ethiopia',
            bio || null,
            avatar_url || null,
            language || 'am',
            timezone || 'Africa/Addis_Ababa',
            notification_preferences ? JSON.stringify(notification_preferences) : null,
          ]
        );
      } else {
        // Update existing profile
        const updateProfileQuery = `
          UPDATE user_profiles SET
          ${school_name !== undefined ? 'school_name = ?,' : ''}
          ${school_address !== undefined ? 'school_address = ?,' : ''}
          ${school_phone !== undefined ? 'school_phone = ?,' : ''}
          ${school_email !== undefined ? 'school_email = ?,' : ''}
          ${school_reg_number !== undefined ? 'school_reg_number = ?,' : ''}
          ${city !== undefined ? 'city = ?,' : ''}
          ${region !== undefined ? 'region = ?,' : ''}
          ${country !== undefined ? 'country = ?,' : ''}
          ${bio !== undefined ? 'bio = ?,' : ''}
          ${avatar_url !== undefined ? 'avatar_url = ?,' : ''}
          ${language !== undefined ? 'language = ?,' : ''}
          ${timezone !== undefined ? 'timezone = ?,' : ''}
          ${notification_preferences !== undefined ? 'notification_preferences = ?,' : ''}
          updated_at = NOW()
          WHERE user_id = ?
        `;

        const profileParams = [
          ...(school_name !== undefined ? [school_name] : []),
          ...(school_address !== undefined ? [school_address] : []),
          ...(school_phone !== undefined ? [school_phone] : []),
          ...(school_email !== undefined ? [school_email] : []),
          ...(school_reg_number !== undefined ? [school_reg_number] : []),
          ...(city !== undefined ? [city] : []),
          ...(region !== undefined ? [region] : []),
          ...(country !== undefined ? [country] : []),
          ...(bio !== undefined ? [bio] : []),
          ...(avatar_url !== undefined ? [avatar_url] : []),
          ...(language !== undefined ? [language] : []),
          ...(timezone !== undefined ? [timezone] : []),
          ...(notification_preferences !== undefined ? [JSON.stringify(notification_preferences)] : []),
          userId,
        ];

        await conn.execute(updateProfileQuery, profileParams);
      }

      // Log audit
      await conn.execute(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, 'PROFILE_UPDATED', 'user_profiles', userId, JSON.stringify(req.body)]
      );

      conn.release();

      res.json({
        success: true,
        message: 'Profile updated successfully',
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// CHANGE PASSWORD
// ============================================
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'New password must be at least 8 characters long',
      });
    }

    const bcrypt = require('bcryptjs');
    const conn = await pool.getConnection();

    try {
      // Get current password hash
      const [users] = await conn.execute(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);

      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      // Update password
      await conn.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [newPasswordHash, userId]
      );

      // Log audit
      await conn.execute(
        `INSERT INTO audit_logs (user_id, action, entity_type)
         VALUES (?, ?, ?)`,
        [userId, 'PASSWORD_CHANGED', 'users']
      );

      conn.release();

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^[0-9+\-\s]{7,20}$/;
  return phoneRegex.test(phone);
}

export { router as profileRouter };
