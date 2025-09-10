import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveUser as ActiveUserData } from '../interfaces/active-user.inteface';
import { REQUEST_USER_KEY } from '../constants/auth.constant';

export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: ActiveUserData = request[REQUEST_USER_KEY];
    // If a user passes a field to the decorator use only that field
    return field ? user?.[field] : user;
  },
);
