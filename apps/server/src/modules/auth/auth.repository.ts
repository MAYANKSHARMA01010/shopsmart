import prisma from '../../shared/config/database';
import { Prisma } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findUserByIdentifier(identifier: string) {
    return prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });
  }

  async createUserWithCart(data: Prisma.UserCreateInput) {
    return prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({ data });
      await tx.cart.create({ data: { userId: newUser.id } });
      return newUser;
    }, { maxWait: 10000, timeout: 20000 });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async findUserByUsernameExcept(username: string, excludeId: string) {
    return prisma.user.findFirst({
      where: {
        username,
        NOT: { id: excludeId },
      },
    });
  }

  async saveRefreshToken(userId: string, hashedToken: string, expiresAt: Date, deviceInfo?: string) {
    return prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId,
        expiresAt,
        deviceInfo: deviceInfo || null,
      },
    });
  }

  async findRefreshToken(hashedToken: string) {
    return prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });
  }

  async revokeRefreshTokenByToken(hashedToken: string) {
    return prisma.refreshToken.update({
      where: { token: hashedToken },
      data: { isRevoked: true },
    });
  }

  async revokeRefreshTokenById(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { isRevoked: true },
    });
  }

  // ─── OTP Token Management ───────────────────────────────────────────────────

  async createOtpToken(data: {
    userId: string;
    type: 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION';
    target: string;
    otpHash: string;
    expiresAt: Date;
  }) {
    // Invalidate existing unused OTPs of the same type for this user
    await prisma.otpToken.updateMany({
      where: {
        userId: data.userId,
        type: data.type,
        isUsed: false,
      },
      data: { isUsed: true },
    });

    return prisma.otpToken.create({
      data: {
        userId: data.userId,
        type: data.type,
        target: data.target,
        otpHash: data.otpHash,
        expiresAt: data.expiresAt,
        isUsed: false,
        attempts: 0,
      },
    });
  }

  async findLatestActiveOtp(userId: string, type: 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION') {
    return prisma.otpToken.findFirst({
      where: {
        userId,
        type,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async incrementOtpAttempts(id: string) {
    return prisma.otpToken.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }

  async markOtpAsUsed(id: string) {
    return prisma.otpToken.update({
      where: { id },
      data: { isUsed: true },
    });
  }
}

export const authRepository = new AuthRepository();

