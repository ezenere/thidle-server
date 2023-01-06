import { Request } from 'express';

export interface URequest extends Request {
  user: {
    id: number;
    exp: number;
  };
}
