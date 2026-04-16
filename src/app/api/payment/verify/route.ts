import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    // Service role client — RLS bypass karke is_premium update karta hai
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            restaurant_id,
            plan,
        } = await req.json();

        // Razorpay signature verify karo
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // Premium expiry date calculate karo
        const expiresAt = new Date();
        if (plan === 'yearly') {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        // Restaurant ko premium karo
        const { error: updateError } = await supabaseAdmin
            .from('restaurants')
            .update({
                is_premium: true,
                premium_expires_at: expiresAt.toISOString(),
            })
            .eq('id', restaurant_id);

        if (updateError) {
            console.error('Update restaurant error:', updateError);
            return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
        }

        // Payment record save karo
        await supabaseAdmin.from('payments').insert({
            restaurant_id,
            razorpay_order_id,
            razorpay_payment_id,
            amount: plan === 'yearly' ? 3999 : 499,
            plan,
            status: 'paid',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Verify payment error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
