export type Role = 'USER' | 'ADMIN';
export interface User { id: number; name: string; email: string; role: Role; }
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest extends LoginRequest { name: string; }
export interface AuthResponse { token: string; user: User; }