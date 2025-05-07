type User = {
  id: number;
  email: string; // 0 -> admin
  name: string;
  picture: string;
  role: "admin" | "maintainer" | "editor" | "viewer";
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
