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

        // Fetch restaurant_id associated with the user
        const { data: restaurant, error: fetchError } = await supabaseAdmin
            .from('restaurants')
            .select('id')
            .eq('owner_id', user.id)
            .single();

        if (fetchError || !restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        // Starter is free forever, set expiry to 100 years in future
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 100);

        // Update restaurant to Starter plan & mark as premium
        const { error: updateError } = await supabaseAdmin
            .from('restaurants')
            .update({
                is_premium: true,
                premium_expires_at: expiresAt.toISOString(),
                plan_tier: 'starter',
            })
            .eq('id', restaurant.id);

        if (updateError) {
            console.error('Update restaurant error:', updateError);
            return NextResponse.json({ error: 'Failed to activate free plan' }, { status: 500 });
        }

        // Save a mock or zero payment record for bookkeeping/history
        await supabaseAdmin.from('payments').upsert({
            restaurant_id: restaurant.id,
            razorpay_order_id: `free_starter_${restaurant.id}_${Date.now()}`,
            amount: 0,
            plan: 'starter',
            status: 'paid',
        }, { onConflict: 'razorpay_order_id' });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Activate free plan error:', error);
        return NextResponse.json({ error: 'Failed to activate free plan' }, { status: 500 });
    }
}
