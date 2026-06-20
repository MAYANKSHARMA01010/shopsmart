import { Request, Response } from 'express';
import { addressService } from './address.service';

export const getUserAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const addresses = await addressService.getUserAddresses(userId);
    res.status(200).json({ status: 'success', data: { addresses } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getAddressById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const addressId = req.params.id as string;
    const address = await addressService.getAddressById(addressId, userId);
    res.status(200).json({ status: 'success', data: { address } });
  } catch (error: any) {
    res.status(404).json({ status: 'error', message: error.message });
  }
};

export const createAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const address = await addressService.createAddress(userId, req.body);
    res.status(201).json({ status: 'success', data: { address } });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const addressId = req.params.id as string;
    const address = await addressService.updateAddress(addressId, userId, req.body);
    res.status(200).json({ status: 'success', data: { address } });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const addressId = req.params.id as string;
    await addressService.deleteAddress(addressId, userId);
    res.status(200).json({ status: 'success', message: 'Address deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
