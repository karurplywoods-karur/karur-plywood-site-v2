// src/app/api/coupons/validate/route.ts
// POST { code, cart_total, customer_id? }
// Returns { valid, discount_amount, coupon } or { error }

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { createServerSupabase } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    const { code, cart_total } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 });
    }
    if (!cart_total || typeof cart_total !== 'number') {
      return NextResponse.json({ error: 'Cart total is required.' }, { status: 400 });
    }

    // Get the coupon (case-insensitive)
    const { data: coupon, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .ilike('code', code.trim())
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code.' }, { status: 404 });
    }

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired.' }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit.' }, { status: 400 });
    }

    // Check minimum order value
    if (coupon.min_order_value && cart_total < coupon.min_order_value) {
      return NextResponse.json({
        error: `Minimum order of â‚¹${coupon.min_order_value.toLocaleString('en-IN')} required for this coupon.`,
      }, { status: 400 });
    }

    // Check if this customer already used this coupon
    const supabase = createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const { data: usages } = await supabaseAdmin
        .from('coupon_usages')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('customer_id', session.user.id)
        .limit(1);

      if (usages && usages.length > 0) {
        return NextResponse.json({ error: 'You have already used this coupon.' }, { status: 400 });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percent') {
      discountAmount = Math.round((cart_total * coupon.discount_value) / 100);
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else {
      // flat
      discountAmount = Math.min(coupon.discount_value, cart_total);
    }

    return NextResponse.json({
      valid: true,
      coupon_id:       coupon.id,
      coupon_code:     coupon.code,
      description:     coupon.description,
      discount_type:   coupon.discount_type,
      discount_value:  coupon.discount_value,
      discount_amount: discountAmount,
      final_total:     Math.max(0, cart_total - discountAmount),
    });

  } catch (err: any) {
    console.error('[coupon/validate]', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

