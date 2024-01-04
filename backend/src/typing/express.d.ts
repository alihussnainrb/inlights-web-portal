export type SessionUser = {
  email: string;
  name: string;
  password: string;
};

declare module "express-serve-static-core" {
  interface Request {
    authUser?: SessionUser | null;
  }
}
