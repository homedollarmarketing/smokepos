import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

interface ApiResponse<T = any> {
    success: boolean;
    payload: T;
}

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req).pipe(
        map((event) => {
            if (event instanceof HttpResponse) {
                const body = event.body as ApiResponse;
                if (body && typeof body === 'object' && body.success && body.payload) {
                    return event.clone({ body: body.payload });
                }
            }
            return event;
        })
    );
};
