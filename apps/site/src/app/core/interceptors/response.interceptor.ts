import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

/**
 * HTTP interceptor that unwraps API responses.
 * The API wraps all responses in { success: boolean, payload: T, message?: string }
 * This interceptor extracts the payload so components receive the data directly.
 */
export const responseInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req).pipe(
        map(event => {
            if (event instanceof HttpResponse && event.body) {
                const body = event.body as { success?: boolean; payload?: unknown };
                // Check if response has the expected wrapper format
                if (body.success !== undefined && body.payload !== undefined) {
                    return event.clone({ body: body.payload });
                }
            }
            return event;
        })
    );
};
