import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Try to get locale from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    let locale = 'en';

    if (acceptLanguage && acceptLanguage.includes('es')) {
        locale = 'es';
    }

    // 2. Try particular Geo headers (Vercel/Cloudflare usually provide these)
    const country = (request as any).geo?.country || request.headers.get('x-vercel-ip-country');
    if (country === 'AR') {
        locale = 'es';
    }

    // Clone the request headers and set the new header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-lang', locale);

    // Return the response with the modified headers
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
