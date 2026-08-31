import jwt from 'jsonwebtoken';
import { env } from '../../shared/config/env';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AppError } from '../../shared/utils/AppError';
import { JwtPayload } from './auth.types';
import { Role } from '@prisma/client';
import { authRepository } from './auth.repository';
import { emailService } from '../email/email.service';
import logger from '../../shared/utils/logger';

const ACCESS_SECRET = env.JWT_ACCESS_SECRET;

const REFRESH_SECRET = env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = env.JWT_ACCESS_EXPIRES_IN;
const REFRESH_EXPIRES = env.JWT_REFRESH_EXPIRES_IN;

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

class AuthService {
  async register(data: Record<string, string>, deviceInfo?: string) {
    // Check if email already exists
    const existingEmail = await authRepository.findUserByEmail(data.email);
    if (existingEmail) {
      throw new AppError('Email is already registered', 409);
    }

    // Handle username derivation/check
    let username = data.username;
    if (!username) {
      const localPart = data.email.split('@')[0].replace(/[^a-zA-Z0-9_.-]/g, '');
      username = localPart;

      let isUnique = false;
      let count = 0;
      while (!isUnique && count < 10) {
        const existing = await authRepository.findUserByUsername(username);
        if (!existing) {
          isUnique = true;
        } else {
          const suffix = Math.floor(1000 + Math.random() * 9000);
          username = `${localPart}${suffix}`;
          count++;
        }
      }
    } else {
      const existingUsername = await authRepository.findUserByUsername(username);
      if (existingUsername) {
        throw new AppError('Username is already taken', 409);
      }
    }

    // Hash password
    const saltRounds = parseInt(env.BCRYPT_SALT_ROUNDS, 10);
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    // Create user and cart in transaction
    const user = await authRepository.createUserWithCart({
      name: data.name,
      email: data.email,
      username,
      password: passwordHash,
      phone: data.phone,
    });

    const tokens = this.generateTokenPair(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken, deviceInfo);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(data: Record<string, string>, deviceInfo?: string) {
    // Find user by email or username
    const user = await authRepository.findUserByIdentifier(data.identifier);

    if (!user) {
      throw new AppError('Invalid email/username or password', 401);
    }

    // Check password
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email/username or password', 401);
    }

    const tokens = this.generateTokenPair(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken, deviceInfo);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshTokens(rawRefreshToken: string, deviceInfo?: string) {
    try {
      jwt.verify(rawRefreshToken, REFRESH_SECRET);
    } catch {
      throw new AppError('Unauthorized: Invalid or expired refresh token', 401);
    }

    const hashed = hashToken(rawRefreshToken);
    const tokenRecord = await authRepository.findRefreshToken(hashed);

    if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
      throw new AppError('Unauthorized: Invalid or expired refresh token', 401);
    }

    // Rotate refresh token (revoke the old one)
    await authRepository.revokeRefreshTokenById(tokenRecord.id);

    const tokens = this.generateTokenPair(tokenRecord.user);
    await this.saveRefreshToken(tokenRecord.userId, tokens.refreshToken, deviceInfo);

    return tokens;
  }

  async logout(rawRefreshToken: string) {
    const hashed = hashToken(rawRefreshToken);
    try {
      await authRepository.revokeRefreshTokenByToken(hashed);
    } catch {
      // If the token is not in DB or already revoked, fail gracefully for logout
    }
  }

  async getUserById(id: string) {
    const user = await authRepository.findUserById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return this.sanitizeUser(user);
  }

  async updateProfile(id: string, data: { name?: string; username?: string; phone?: string | null; avatar?: string | null; gender?: string | null }) {
    // If username is changing, check uniqueness
    if (data.username) {
      const existing = await authRepository.findUserByUsernameExcept(data.username, id);
      if (existing) {
        throw new AppError('Username is already taken', 409);
      }
    }

    const updatedUser = await authRepository.updateUser(id, {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.username !== undefined && { username: data.username }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.avatar !== undefined && { avatar: data.avatar }),
      ...(data.gender !== undefined && { gender: data.gender }),
    });

    return this.sanitizeUser(updatedUser);
  }

  async changePassword(userId: string, data: Record<string, string>) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Incorrect current password', 400);
    }

    const saltRounds = parseInt(env.BCRYPT_SALT_ROUNDS, 10);
    const passwordHash = await bcrypt.hash(data.newPassword, saltRounds);

    await authRepository.updateUser(userId, { password: passwordHash });
  }

  // ─── Secure OTP Verification Flow (5-Minute Expiry & One-Time Use) ────────


  async sendEmailOtp(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate secure 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = hashToken(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store hashed OTP in database (invalidates previous OTPs)
    await authRepository.createOtpToken({
      userId,
      type: 'EMAIL_VERIFICATION',
      target: user.email,
      otpHash,
      expiresAt,
    });

    // Send transactional email with OTP
    try {
      await emailService.sendOtpEmail(user.email, user.name, rawOtp, 'Email Address Verification');
    } catch (err) {
      logger.error('Failed to dispatch verification email', { error: err });
    }

    logger.info('otp.email.generated', {
      userId,
      email: user.email,
      expiresAt,
      // Log raw OTP only in non-production for frictionless testing
      debugOtp: env.NODE_ENV !== 'production' ? rawOtp : undefined,
    });

    return {
      message: 'Verification code sent to your email. Valid for 5 minutes.',
      expiresInSeconds: 300,
      debugOtp: env.NODE_ENV !== 'production' ? rawOtp : undefined,
    };
  }

  async verifyEmailOtp(userId: string, inputOtp: string) {
    if (!inputOtp || inputOtp.trim().length !== 6) {
      throw new AppError('Please enter a valid 6-digit verification code.', 400);
    }

    const activeOtp = await authRepository.findLatestActiveOtp(userId, 'EMAIL_VERIFICATION');
    if (!activeOtp) {
      throw new AppError('Verification code has expired or is invalid. Please request a new code.', 400);
    }

    // Brute force protection: max 5 failed attempts per OTP
    if (activeOtp.attempts >= 5) {
      await authRepository.markOtpAsUsed(activeOtp.id);
      throw new AppError('Too many failed attempts. This verification code has been revoked. Please request a new one.', 429);
    }

    const hashedInput = hashToken(inputOtp.trim());
    if (hashedInput !== activeOtp.otpHash) {
      await authRepository.incrementOtpAttempts(activeOtp.id);
      const remaining = 4 - activeOtp.attempts;
      throw new AppError(`Invalid verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Code revoked.'}`, 400);
    }

    // Mark OTP as used immediately (expires upon verification)
    await authRepository.markOtpAsUsed(activeOtp.id);

    // Update user status
    const updatedUser = await authRepository.updateUser(userId, { isEmailVerified: true });
    logger.info('otp.email.verified', { userId, email: updatedUser.email });

    return {
      user: this.sanitizeUser(updatedUser),
      message: 'Email address verified successfully!',
    };
  }

  async sendPhoneOtp(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (!user.phone || user.phone.trim() === '') {
      throw new AppError('Please add a phone number to your profile before verifying.', 400);
    }

    // Generate secure 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = hashToken(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store hashed OTP in database
    await authRepository.createOtpToken({
      userId,
      type: 'PHONE_VERIFICATION',
      target: user.phone,
      otpHash,
      expiresAt,
    });

    logger.info('otp.phone.generated', {
      userId,
      phone: user.phone,
      expiresAt,
      debugOtp: env.NODE_ENV !== 'production' ? rawOtp : undefined,
    });

    return {
      message: 'Verification code sent to your phone number. Valid for 5 minutes.',
      expiresInSeconds: 300,
      debugOtp: env.NODE_ENV !== 'production' ? rawOtp : undefined,
    };
  }

  async verifyPhoneOtp(userId: string, inputOtp: string) {
    if (!inputOtp || inputOtp.trim().length !== 6) {
      throw new AppError('Please enter a valid 6-digit verification code.', 400);
    }

    const activeOtp = await authRepository.findLatestActiveOtp(userId, 'PHONE_VERIFICATION');
    if (!activeOtp) {
      throw new AppError('Verification code has expired or is invalid. Please request a new code.', 400);
    }

    // Brute force protection: max 5 failed attempts
    if (activeOtp.attempts >= 5) {
      await authRepository.markOtpAsUsed(activeOtp.id);
      throw new AppError('Too many failed attempts. This verification code has been revoked. Please request a new one.', 429);
    }

    const hashedInput = hashToken(inputOtp.trim());
    if (hashedInput !== activeOtp.otpHash) {
      await authRepository.incrementOtpAttempts(activeOtp.id);
      const remaining = 4 - activeOtp.attempts;
      throw new AppError(`Invalid verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Code revoked.'}`, 400);
    }

    // Mark OTP as used immediately (expires upon verification)
    await authRepository.markOtpAsUsed(activeOtp.id);

    // Update user status
    const updatedUser = await authRepository.updateUser(userId, { isPhoneVerified: true });
    logger.info('otp.phone.verified', { userId, phone: updatedUser.phone });

    return {
      user: this.sanitizeUser(updatedUser),
      message: 'Phone number verified successfully!',
    };
  }

  // ─── Legacy / Direct verification fallback ────────────────────────────────

  async verifyEmail(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    const updated = await authRepository.updateUser(userId, { isEmailVerified: true });
    return this.sanitizeUser(updated);
  }

  async verifyPhone(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (!user.phone || user.phone.trim() === '') {
      throw new AppError('Please set a phone number in your profile before verifying.', 400);
    }
    const updated = await authRepository.updateUser(userId, { isPhoneVerified: true });
    return this.sanitizeUser(updated);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────



  private generateTokenPair(user: { id: string; email: string; role: Role }) {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES as jwt.SignOptions['expiresIn'] });
    const refreshToken = jwt.sign(
      { id: user.id, jti: crypto.randomUUID() },
      REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRES as jwt.SignOptions['expiresIn'] }
    );

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, rawToken: string, deviceInfo?: string) {
    const hashed = hashToken(rawToken);
    
    // Parse duration (default 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await authRepository.saveRefreshToken(userId, hashed, expiresAt, deviceInfo);
  }

  private sanitizeUser(user: Record<string, unknown>) {
    const sanitized = { ...user };
    delete sanitized.password;
    return sanitized;
  }
}

export default new AuthService();
