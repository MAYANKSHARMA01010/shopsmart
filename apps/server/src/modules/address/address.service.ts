import prisma from '../../shared/config/database';

export const addressService = {
  async getUserAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getAddressById(addressId: string, userId: string) {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });
    
    if (!address || address.userId !== userId) {
      throw new Error('Address not found or unauthorized');
    }
    
    return address;
  },

  async createAddress(userId: string, data: {
    name: string;
    email: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isDefault?: boolean;
  }) {
    if (data.isDefault) {
      // Unset previous defaults
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // If it's their first address, make it default automatically
    const count = await prisma.address.count({ where: { userId } });
    if (count === 0) {
      data.isDefault = true;
    }

    return prisma.address.create({
      data: {
        ...data,
        userId,
      },
    });
  },

  async updateAddress(addressId: string, userId: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    isDefault?: boolean;
  }) {
    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id: addressId } });
    if (!existing || existing.userId !== userId) {
      throw new Error('Address not found or unauthorized');
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId },
      data,
    });
  },

  async deleteAddress(addressId: string, userId: string) {
    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id: addressId } });
    if (!existing || existing.userId !== userId) {
      throw new Error('Address not found or unauthorized');
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    // If we deleted the default address, make the most recently created address the new default
    if (existing.isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      if (nextAddress) {
        await prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true }
        });
      }
    }
  }
};
