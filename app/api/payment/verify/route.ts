import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment Verified
      const supabase = await createClient();
      
      // Update user metadata to set is_premium: true
      const { error } = await supabase.auth.updateUser({
        data: { is_premium: true }
      });

      if (error) throw error;

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Signature mismatch' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
