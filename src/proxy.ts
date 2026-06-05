import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Check if user is admin by email list
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'hello@digirestau.com').split(',');
    let isAdmin = user?.email ? adminEmails.includes(user.email) : false;

    // Protected routes: Redirect to login if not authenticated
    if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Redirect admin to /admin if they try to access /dashboard or /login or /signup
    if (user && isAdmin && (pathname.startsWith('/dashboard') || pathname === '/login' || pathname === '/signup')) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
    }

    // Redirect normal user to /dashboard if they try to access /login or /signup or /admin
    if (user && !isAdmin) {
        if (pathname === '/login' || pathname === '/signup' || pathname.startsWith('/admin')) {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/dashboard/:path*', 
        '/admin/:path*',
        '/login', 
        '/signup'
    ],
};
