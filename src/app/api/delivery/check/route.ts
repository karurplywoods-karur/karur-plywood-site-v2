// src/app/api/delivery/check/route.ts
// Preferred:  GET /api/delivery/check?lat=10.9612&lng=78.0812   (radius-based, from map pin)
// Fallback:   GET /api/delivery/check?city=Kulithalai&pincode=639120  (area-name match)
// Public endpoint — used by DeliveryChecker (homepage/product/checkout).
import { NextRequest, NextResponse } from 'next/server';
import {
  getActiveZones, resolveZoneByAreaName, calculateDeliveryPromise, getDeliveryPromiseForCoords,
} from '@/lib/deliveryEngine';

// Karur district pincodes start with 639. Outside this range we don't
// currently deliver — matches "Launch Area: Karur District only."
const KARUR_PINCODE_PREFIX = '639';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const city = (searchParams.get('city') || '').trim();
    const pincode = (searchParams.get('pincode') || '').trim();

    if (!lat && !lng && !city && !pincode) {
      return NextResponse.json(
        { error: 'Provide lat/lng (preferred) or a city/area name.' },
        { status: 400 }
      );
    }

    // ── Preferred path: customer has dropped a pin, measure real radius ──
    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
        return NextResponse.json({ error: 'Invalid lat/lng.' }, { status: 400 });
      }

      const result = await getDeliveryPromiseForCoords(latNum, lngNum);

      if (!result) {
        return NextResponse.json({
          available: false,
          reason: "That location is outside our delivery coverage, or we couldn't confirm it automatically — our team will confirm on WhatsApp.",
          contactWhatsApp: true,
        });
      }

      return NextResponse.json({
        available: true,
        zone: { code: result.zone.zone_code, name: result.zone.zone_name },
        distanceKm: result.distanceKm,
        promiseLabel: result.promiseLabel,
        cutoffTimeLabel: result.cutoffTimeLabel,
        isBeforeCutoff: result.isBeforeCutoff,
        estimatedDeliveryDate: result.estimatedDeliveryDate,
        isBusinessHours: result.isBusinessHours,
        verificationSlaMinutes: result.verificationSlaMinutes,
      });
    }

    // ── Fallback path: area-name match (no pin available yet) ──
    const zones = await getActiveZones();
    const zone = city ? resolveZoneByAreaName(zones, city) : null;

    if (!zone) {
      const outOfKarurDistrict = pincode && !pincode.startsWith(KARUR_PINCODE_PREFIX);
      return NextResponse.json({
        available: false,
        reason: outOfKarurDistrict
          ? 'We currently deliver only within Karur District.'
          : "We couldn't match that area automatically — our team will confirm delivery availability on WhatsApp.",
        contactWhatsApp: true,
      });
    }

    const promise = await calculateDeliveryPromise(zone);

    return NextResponse.json({
      available: true,
      zone: { code: zone.zone_code, name: zone.zone_name },
      promiseLabel: promise.promiseLabel,
      cutoffTimeLabel: promise.cutoffTimeLabel,
      isBeforeCutoff: promise.isBeforeCutoff,
      estimatedDeliveryDate: promise.estimatedDeliveryDate,
      isBusinessHours: promise.isBusinessHours,
      verificationSlaMinutes: promise.verificationSlaMinutes,
    });
  } catch (err: any) {
    console.error('Delivery check error:', err);
    return NextResponse.json({ error: err.message || 'Delivery check failed.' }, { status: 500 });
  }
}
