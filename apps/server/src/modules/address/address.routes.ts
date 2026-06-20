import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.middleware';
import {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress
} from './address.controller';

const router = Router();

// All address routes require authentication
router.use(authenticate);

router.get('/', getUserAddresses);
router.post('/', createAddress);
router.get('/:id', getAddressById);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;
