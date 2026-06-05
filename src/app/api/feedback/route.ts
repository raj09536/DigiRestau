import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { restaurant_id, rating, features, comments } = body;

        if (!restaurant_id || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify the user owns this restaurant
        const { data: restaurant, error: fetchError } = await supabaseAdmin
            .from('restaurants')
            .select('id')
            .eq('owner_id', user.id)
            .eq('id', restaurant_id)
            .single();

        if (fetchError || !restaurant) {
            return NextResponse.json({ error: 'Restaurant not found or unauthorized' }, { status: 404 });
        }

        // Format comments for easy reading in database viewer
        const formattedComment = `[PLATFORM FEEDBACK]
Features requested: ${features ? features.trim() : 'None'}
General comments: ${comments ? comments.trim() : 'None'}`;

        // Insert feedback using admin client
        const { error: insertError } = await supabaseAdmin
            .from('order_feedback')
            .insert({
                restaurant_id: restaurant.id,
                order_id: null, // null represents platform feedback
                rating: rating,
                comment: formattedComment
            });

        if (insertError) {
            console.error('Insert platform feedback error:', insertError);
            return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Submit platform feedback error:', error);
        return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
    }
}
