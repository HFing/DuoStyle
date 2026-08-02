export interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}
