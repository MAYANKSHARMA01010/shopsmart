import { JwtPayload } from './auth';

export {};

declare global {
  namespace Express {
    interface Request {
      /**
       * Set by the `authenticate` middleware.
       */
      user?: JwtPayload;
    }
  }
}
