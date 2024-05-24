import { Request } from 'express';
import { User } from 'src/users/entities/User.entity';

export interface CustomRequest extends Request {
  user: User;
}
