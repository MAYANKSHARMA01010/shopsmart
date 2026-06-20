import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AppError } from '../../shared/utils/AppError';
import { JwtPayload } from './auth.types';
import { Role } from '@prisma/client';
import { authRepository } from './auth.repository';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

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
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
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

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(data.newPassword, saltRounds);

    await authRepository.updateUser(userId, { password: passwordHash });
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
