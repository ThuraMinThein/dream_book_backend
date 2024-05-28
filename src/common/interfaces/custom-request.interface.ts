import { Request } from 'express';
import { User } from '../../users/entities/User.entity';

export interface CustomRequest extends Request {
  user: User;
}
