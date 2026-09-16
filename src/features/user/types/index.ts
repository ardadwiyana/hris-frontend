import type { Role } from "@/constants/auth";

export interface User {
  id: number;
  username: string;
  role: Role;
  createdAt?: string;
}

// Matches registerUserSchema on the backend. There is no PUT /users/:id,
// so editing an existing user is intentionally not offered.
export interface CreateUserPayload {
  username: string;
  password: string;
  role: Role;
}
