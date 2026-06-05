export interface User {
  url?: string;
  username: string;
  email?: string;
  groups?: string[];
}

export interface UserCredentials {
  username: string;
  password?: string;
}

export interface AuthResponse {
  access: string;
  refresh?: string;
}
