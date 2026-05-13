import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { plan = 'pro' } = await req.json();
        
        // Fetch restaurant_id
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('owner_id', user.id)
            .single();

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        // Prices in paise (₹1 = 100 paise)
        const prices: Record<string, number> = {
            starter: 9900,
            pro: 49900,
            max: 99900,
            monthly: 49900,
            yearly: 399900
        };

        const amount = prices[plan] || 49900;

        const order = await razorpay.orders.create({
            amount,
            currency: 'INR',
            notes: {
                user_id: user.id,
                restaurant_id: restaurant.id,
                plan,
            },
        });

        // Save pending payment record for webhook backup
        await supabase.from('payments').insert({
            restaurant_id: restaurant.id,
            razorpay_order_id: order.id,
            amount: amount / 100,
            plan,
            status: 'pending',
        });

        return NextResponse.json({
            order_id: order.id,
            amount,
            currency: 'INR',
        });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
