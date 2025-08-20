import { User } from '../../users/entities/user.entity';

export class Business {
  id: string;
  name: string;
  address: string;
  businessType: string;
  image: string;
  shopkeeper: User;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdBy: User;
  updatedBy: User;
  deletedBy: User | null;
  isActive: boolean;
}
