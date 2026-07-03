export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
}

export interface Options {
  pageLength: number;
  page: number;
}
