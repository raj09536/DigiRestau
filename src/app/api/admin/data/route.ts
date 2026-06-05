import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        // Authenticate the user
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Validate admin email (via env list OR database restaurants.is_admin flag)
        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'hello@digirestau.com').split(',');
        let isDbAdmin = false;

        const { data: restaurant } = await supabaseAdmin
            .from('restaurants')
            .select('is_admin')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (restaurant?.is_admin) {
            isDbAdmin = true;
        }

        if ((!user.email || !adminEmails.includes(user.email)) && !isDbAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch contact messages (restaurant_id is null, order_id is null)
        const { data: contacts, error: contactsError } = await supabaseAdmin
            .from('order_feedback')
            .select('id, rating, comment, created_at')
            .is('order_id', null)
            .is('restaurant_id', null)
            .order('created_at', { ascending: false });

        if (contactsError) {
            console.error('Fetch admin contacts error:', contactsError);
            return NextResponse.json({ error: 'Failed to fetch contact messages' }, { status: 500 });
        }

        // Fetch platform feedbacks (restaurant_id is not null, order_id is null)
        // Joint query to pull restaurant names
        const { data: feedbacks, error: feedbacksError } = await supabaseAdmin
            .from('order_feedback')
            .select(`
                id,
                rating,
                comment,
                created_at,
                restaurant_id,
                restaurants (
                    name,
                    slug
                )
            `)
            .is('order_id', null)
            .not('restaurant_id', 'is', null)
            .order('created_at', { ascending: false });

        if (feedbacksError) {
            console.error('Fetch admin feedbacks error:', feedbacksError);
            return NextResponse.json({ error: 'Failed to fetch platform feedbacks' }, { status: 500 });
        }

        return NextResponse.json({
            contacts: contacts || [],
            feedbacks: feedbacks || []
        });

    } catch (error) {
        console.error('Admin API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
