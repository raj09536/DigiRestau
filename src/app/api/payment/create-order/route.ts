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

        const { plan = 'monthly' } = await req.json();
        // Amount in paise (₹499 = 49900 paise)
        const amount = plan === 'yearly' ? 399900 : 49900;

        const order = await razorpay.orders.create({
            amount,
            currency: 'INR',
            notes: {
                user_id: user.id,
                plan,
            },
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
