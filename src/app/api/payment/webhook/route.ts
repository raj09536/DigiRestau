import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature');
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('RAZORPAY_WEBHOOK_SECRET is not set');
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.error('Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const payload = JSON.parse(body);
        const event = payload.event;

        console.log('Razorpay Webhook Event:', event);

        // Handle successful payment
        if (event === 'order.paid' || event === 'payment.captured') {
            const paymentData = payload.payload.payment.entity;
            const orderId = paymentData.order_id;
            
            // Payment record find karo order_id se
            // Note: Humne frontend se payment verify karte waqt payments table mein entry ki thi
            // Lekin webhook backup ki tarah kaam karega agar frontend fail hota hai
            
            // 1. Order ID se restaurant_id aur plan find karo metadata se (agar humne order banate waqt dala tha)
            // Ya phir payments table mein entry check karo
            const { data: paymentRecord, error: paymentError } = await supabaseAdmin
                .from('payments')
                .select('*')
                .eq('razorpay_order_id', orderId)
                .single();

            if (paymentRecord && paymentRecord.status !== 'paid') {
                // Restaurant update karo
                const expiresAt = new Date();
                if (paymentRecord.plan === 'yearly') {
                    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
                } else {
                    expiresAt.setMonth(expiresAt.getMonth() + 1);
                }

                await supabaseAdmin
                    .from('restaurants')
                    .update({
                        is_premium: true,
                        premium_expires_at: expiresAt.toISOString(),
                        plan_tier: paymentRecord.plan,
                    })
                    .eq('id', paymentRecord.restaurant_id);

                // Payment status update karo
                await supabaseAdmin
                    .from('payments')
                    .update({ status: 'paid' })
                    .eq('id', paymentRecord.id);
            }
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
