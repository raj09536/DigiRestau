import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const body = await req.json();
        const { name, email, message } = body;

        if (!name || !name.trim() || !email || !email.trim() || !message || !message.trim()) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
        }

        // Format message for insertion
        const formattedComment = `[CONTACT MESSAGE]
Name: ${name.trim()}
Email: ${email.trim()}
Message: ${message.trim()}`;

        // Insert contact message into order_feedback table using admin client
        const { error: insertError } = await supabaseAdmin
            .from('order_feedback')
            .insert({
                restaurant_id: null, // null represents non-restaurant public contact message
                order_id: null,      // null represents non-order platform message
                rating: 5,           // default positive rating
                comment: formattedComment
            });

        if (insertError) {
            console.error('Insert contact message error:', insertError);
            return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Submit contact message error:', error);
        return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 });
    }
}
