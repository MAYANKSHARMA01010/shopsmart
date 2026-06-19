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
    });
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
}

export const authRepository = new AuthRepository();
