type User = {
  email: string; // 0 -> admin
  name: string;
  picture: string;
};

declare namespace App {
  interface SessionData {
    user: User | null;
  }
  interface Locals {
    user: User;
    isAdmin: boolean;
  }
}
