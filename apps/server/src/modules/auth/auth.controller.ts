import { Request, Response } from 'express';
import authService from '../auth/auth.service';
import { catchAsync } from '../../shared/utils/catchAsync';

export const register = catchAsync(async (req: Request, res: Response) => {
  const deviceInfo = req.headers['user-agent'] || undefined;
  const result = await authService.register(req.body, deviceInfo);
  
  res.status(201).json({
    status: 'success',
    data: result,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const deviceInfo = req.headers['user-agent'] || undefined;
  const result = await authService.login(req.body, deviceInfo);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const deviceInfo = req.headers['user-agent'] || undefined;
  const { refreshToken } = req.body;
  const result = await authService.refreshTokens(refreshToken, deviceInfo);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = await authService.getUserById(userId);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = await authService.updateProfile(userId, req.body);

  res.status(200).json({
    status: 'success',
    data: { user },
    message: 'Profile updated successfully',
  });
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await authService.changePassword(userId, req.body);

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
});

export const sendEmailOtp = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await authService.sendEmailOtp(userId);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const verifyEmailOtp = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { otp } = req.body;
  const result = await authService.verifyEmailOtp(userId, otp);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const sendPhoneOtp = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const channel = req.body?.channel === 'sms' ? 'sms' : 'whatsapp';
  const result = await authService.sendPhoneOtp(userId, channel);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});



export const verifyPhoneOtp = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { otp } = req.body;
  const result = await authService.verifyPhoneOtp(userId, otp);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = await authService.verifyEmail(userId);

  res.status(200).json({
    status: 'success',
    data: { user },
    message: 'Email verified successfully',
  });
});

export const verifyPhone = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = await authService.verifyPhone(userId);

  res.status(200).json({
    status: 'success',
    data: { user },
    message: 'Phone number verified successfully',
  });
});


