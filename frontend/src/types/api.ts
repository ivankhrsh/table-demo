export interface ApiErrorResponse {
  error?: string;
  message?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response?: ApiErrorResponse
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromAxiosError(error: unknown): ApiError {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { status: number; data?: ApiErrorResponse };
        message?: string;
      };
      const status = axiosError.response?.status ?? 500;
      const errorData = axiosError.response?.data;
      const message =
        errorData?.error || errorData?.message || axiosError.message || 'Request failed';
      return new ApiError(message, status, errorData);
    }
    if (error instanceof Error) {
      return new ApiError(error.message, 500);
    }
    return new ApiError('Unknown error', 500);
  }
}
