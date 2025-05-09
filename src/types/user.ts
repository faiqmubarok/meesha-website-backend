export type User = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
};

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}
