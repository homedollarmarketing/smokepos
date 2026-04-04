import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

/**
 * Interface for API error response
 */
interface ApiErrorResponse {
  success: false;
  message: string;
}

/**
 * HTTP interceptor that handles error responses from the API.
 * Extracts error messages from the API response and shows toast notifications.
 * Re-throws the error with a cleaned-up message for component-level handling.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error && typeof error.error === 'object') {
        const apiError = error.error as ApiErrorResponse;
        if (apiError.message) {
          errorMessage = apiError.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific HTTP status codes
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          break;
        case 401:
          // Don't show toast for unauthorized - auth interceptor handles this
          break;
        case 403:
          errorMessage = errorMessage || 'You do not have permission to perform this action.';
          toastService.error(errorMessage);
          break;
        case 404:
          errorMessage = errorMessage || 'The requested resource was not found.';
          toastService.error(errorMessage);
          break;
        case 409:
          // Conflict - constraint violations
          toastService.error(errorMessage);
          break;
        case 422:
          // Validation error
          toastService.error(errorMessage, 'Validation Error');
          break;
        case 500:
          errorMessage =
            errorMessage || 'An internal server error occurred. Please try again later.';
          toastService.error(errorMessage);
          break;
        default:
          if (error.status >= 400) {
            toastService.error(errorMessage);
          }
      }

      // Re-throw with cleaned message for component-level handling
      const enhancedError = new Error(errorMessage) as Error & {
        status: number;
        originalError: HttpErrorResponse;
      };
      enhancedError.status = error.status;
      enhancedError.originalError = error;

      return throwError(() => enhancedError);
    })
  );
};
