declare module 'bcryptjs' {
  export function hash(password: string, salt: number): Promise<string>;
  export function compare(password: string, hash: string): Promise<boolean>;
}

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
  }

  export function sign(payload: object, secret: string, options?: object): string;
  export function verify(token: string, secret: string): JwtPayload | string;
}

declare module 'morgan' {
  import type { RequestHandler } from 'express';
  const middleware: (format: string, options?: object) => RequestHandler;
  export default middleware;
}
