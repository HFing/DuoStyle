export interface Role {
  id?: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  gender?: string;
  address?: string;
  enabled?: boolean;
  roles?: (string | Role)[];
}
