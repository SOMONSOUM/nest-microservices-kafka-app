import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const LoginCredential = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);
