import { JwtPayload } from '@app/shared';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): number => {
    const request: Request = context.switchToHttp().getRequest();

    const user = request.user as JwtPayload;
    return user.sub;
  },
);
