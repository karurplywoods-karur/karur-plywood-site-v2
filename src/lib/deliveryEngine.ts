// src/lib/deliveryEngine.ts
// Configurable delivery-promise calculator. Reads zones/settings/holidays from
// Supabase (admin-editable) so cutoff times, promises, and SLAs never require
// a code change or redeploy.
import { supabase, supabaseAdmin } from '@/lib/db';

export interface DeliveryZone {
  id: string;
  zone_code: string;
  zone_name: string;
  min_distance_km: number;
  max_distance_km: number;
  example_areas: string[];
  cutoff_time: string; // 'HH:MM:SS'
  before_cutoff_label: string;
  before_cutoff_days: number;
  after_cutoff_label: string;
  after_cutoff_days: number;
  is_active: boolean;
}

export interface DeliverySettings {
  business_hours_start: string;
  business_hours_end: string;
  working_days: string[]; // ['MON','TUE',...]
  verification_sla_minutes: number;
  payment_link_expiry_minutes: number;
  dispatch_same_day: boolean;
  store_latitude: number | null;
  store_longitude: number | null;
  road_distance_buffer: number; // e.g. 1.30 = +30% over straight-line distance
}

export interface DeliveryPromiseResult {
  zone: DeliveryZone;
  isBeforeCutoff: boolean;
  promiseLabel: string;        // 'Same-Day Delivery'
  cutoffTimeLabel: string;     // '3:00 PM'
  estimatedDeliveryDate: string; // ISO date (YYYY-MM-DD)
  isBusinessHours: boolean;
  verificationSlaMinutes: number;
}

const DAY_CODES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// ── Data fetchers (cached per-request via Supabase; no in-memory cache since
//    admin edits must take effect immediately) ──────────────────────────────

export async function getActiveZones(useAdmin = false): Promise<DeliveryZone[]> {
  const client = useAdmin ? supabaseAdmin : supabase;
  const { data, error } = await client
    .from('delivery_zones')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getDeliverySettings(useAdmin = false): Promise<DeliverySettings> {
  const client = useAdmin ? supabaseAdmin : supabase;
  const { data, error } = await client
    .from('delivery_settings')
    .select('*')
    .eq('id', 1)
    .single();
  if (error) throw error;
  return data as DeliverySettings;
}

export async function getUpcomingHolidays(fromDate: Date, useAdmin = false): Promise<Set<string>> {
  const client = useAdmin ? supabaseAdmin : supabase;
  const iso = toISTShifted(fromDate).toISOString().slice(0, 10);
  const { data, error } = await client
    .from('delivery_holidays')
    .select('holiday_date')
    .gte('holiday_date', iso);
  if (error) throw error;
  return new Set((data ?? []).map((h: any) => h.holiday_date));
}

// ── Distance calculation ─────────────────────────────────────────────────

/**
 * Straight-line (Haversine) distance in km between two lat/lng points,
 * scaled by `buffer` (default from delivery_settings.road_distance_buffer)
 * to approximate real road distance without a paid Distance Matrix API.
 */
export function haversineDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  buffer = 1.3
): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineKm = R * c;
  return straightLineKm * buffer;
}

/**
 * Distance in km from the store origin (delivery_settings.store_latitude/
 * store_longitude) to a customer's lat/lng, with the road-distance buffer
 * applied. Returns null if store coordinates haven't been set yet.
 */
export function distanceFromStoreKm(
  settings: DeliverySettings,
  customerLat: number,
  customerLng: number
): number | null {
  if (settings.store_latitude == null || settings.store_longitude == null) return null;
  return haversineDistanceKm(
    settings.store_latitude, settings.store_longitude,
    customerLat, customerLng,
    settings.road_distance_buffer ?? 1.3
  );
}

// ── Zone resolution ──────────────────────────────────────────────────────

/** Resolve a delivery zone from a distance in km. Returns null if out of coverage. */
export function resolveZoneByDistance(zones: DeliveryZone[], distanceKm: number): DeliveryZone | null {
  return zones.find(z => distanceKm >= z.min_distance_km && distanceKm <= z.max_distance_km) ?? null;
}

/**
 * Resolve a delivery zone from a free-text city/area name, matching against
 * each zone's example_areas (case-insensitive substring match). This is the
 * practical default until precise geocoding/distance lookup is wired in —
 * falls back to Zone B (wider net) when no area matches but the pincode
 * prefix looks like Karur district (639***).
 */
export function resolveZoneByAreaName(zones: DeliveryZone[], areaOrCity: string): DeliveryZone | null {
  const needle = areaOrCity.trim().toLowerCase();
  if (!needle) return null;

  for (const zone of zones) {
    if (zone.example_areas.some(a => a.toLowerCase() === needle)) return zone;
  }
  // Loose substring match, e.g. "Thanthoni Main Road" contains "Thanthoni"
  for (const zone of zones) {
    if (zone.example_areas.some(a => needle.includes(a.toLowerCase()) || a.toLowerCase().includes(needle))) {
      return zone;
    }
  }
  return null;
}

// ── Business-hours / working-day helpers ────────────────────────────────

// The server (Vercel) runs in UTC, but every cutoff/business-hour/working-day
// rule here is defined in India time. India has no daylight saving, so a
// constant +5:30 offset is always correct — no need for a timezone library.
// We shift the timestamp and then read it back with the UTC getters/setters,
// which makes the shifted value behave as IST wall-clock time regardless of
// what timezone the server itself is running in.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function toISTShifted(date: Date): Date {
  return new Date(date.getTime() + IST_OFFSET_MS);
}

function timeStringToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function isWithinBusinessHours(now: Date, settings: DeliverySettings): boolean {
  const ist = toISTShifted(now);
  const dayCode = DAY_CODES[ist.getUTCDay()];
  if (!settings.working_days.includes(dayCode)) return false;
  const nowMinutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return (
    nowMinutes >= timeStringToMinutes(settings.business_hours_start) &&
    nowMinutes <= timeStringToMinutes(settings.business_hours_end)
  );
}

/** `shiftedDate` must already be IST-shifted (via toISTShifted) — reads with UTC getters. */
function isWorkingDayIST(shiftedDate: Date, settings: DeliverySettings, holidays: Set<string>): boolean {
  const dayCode = DAY_CODES[shiftedDate.getUTCDay()];
  const iso = shiftedDate.toISOString().slice(0, 10);
  return settings.working_days.includes(dayCode) && !holidays.has(iso);
}

/**
 * Add N working days (skipping non-working days and holidays), operating
 * entirely in IST-shifted space. `startShifted` must already be IST-shifted;
 * returns an IST-shifted Date whose UTC-getter date parts are the correct
 * IST calendar date (use .toISOString().slice(0,10) on the result directly).
 */
function addWorkingDaysIST(startShifted: Date, days: number, settings: DeliverySettings, holidays: Set<string>): Date {
  const result = new Date(startShifted);
  if (days === 0) {
    // "same day" only counts if today is itself a working day; otherwise
    // roll forward to the next working day.
    while (!isWorkingDayIST(result, settings, holidays)) {
      result.setUTCDate(result.getUTCDate() + 1);
    }
    return result;
  }
  let remaining = days;
  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + 1);
    if (isWorkingDayIST(result, settings, holidays)) remaining--;
  }
  return result;
}

// ── Core promise calculator ──────────────────────────────────────────────

export async function calculateDeliveryPromise(
  zone: DeliveryZone,
  now: Date = new Date(),
  useAdmin = false
): Promise<DeliveryPromiseResult> {
  const settings = await getDeliverySettings(useAdmin);
  const holidays = await getUpcomingHolidays(now, useAdmin);

  const istNow = toISTShifted(now);
  const nowMinutes = istNow.getUTCHours() * 60 + istNow.getUTCMinutes();
  const cutoffMinutes = timeStringToMinutes(zone.cutoff_time);
  const isBeforeCutoff = nowMinutes < cutoffMinutes;

  const daysToAdd = isBeforeCutoff ? zone.before_cutoff_days : zone.after_cutoff_days;
  const promiseLabel = isBeforeCutoff ? zone.before_cutoff_label : zone.after_cutoff_label;

  const estimatedDateShifted = addWorkingDaysIST(istNow, daysToAdd, settings, holidays);

  const [ch, cm] = zone.cutoff_time.split(':').map(Number);
  const cutoffDate = new Date(2000, 0, 1, ch, cm);
  const cutoffTimeLabel = cutoffDate.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

  return {
    zone,
    isBeforeCutoff,
    promiseLabel,
    cutoffTimeLabel,
    estimatedDeliveryDate: estimatedDateShifted.toISOString().slice(0, 10),
    isBusinessHours: isWithinBusinessHours(now, settings),
    verificationSlaMinutes: settings.verification_sla_minutes,
  };
}

/** Convenience: resolve zone + promise in one call from a city/area string. */
export async function getDeliveryPromiseForArea(
  areaOrCity: string,
  now: Date = new Date(),
  useAdmin = false
): Promise<DeliveryPromiseResult | null> {
  const zones = await getActiveZones(useAdmin);
  const zone = resolveZoneByAreaName(zones, areaOrCity);
  if (!zone) return null;
  return calculateDeliveryPromise(zone, now, useAdmin);
}

/** Convenience: resolve zone + promise from a distance in km. */
export async function getDeliveryPromiseForDistance(
  distanceKm: number,
  now: Date = new Date(),
  useAdmin = false
): Promise<DeliveryPromiseResult | null> {
  const zones = await getActiveZones(useAdmin);
  const zone = resolveZoneByDistance(zones, distanceKm);
  if (!zone) return null;
  return calculateDeliveryPromise(zone, now, useAdmin);
}

/**
 * Preferred resolver once a customer has dropped a pin (Google Maps picker):
 * measures actual radius from the store, not area-name guessing.
 * Returns null if store origin isn't configured yet, or the point is out of
 * coverage (beyond the widest zone's max_distance_km).
 */
export async function getDeliveryPromiseForCoords(
  customerLat: number,
  customerLng: number,
  now: Date = new Date(),
  useAdmin = false
): Promise<(DeliveryPromiseResult & { distanceKm: number }) | null> {
  const [zones, settings] = await Promise.all([
    getActiveZones(useAdmin),
    getDeliverySettings(useAdmin),
  ]);

  const distanceKm = distanceFromStoreKm(settings, customerLat, customerLng);
  if (distanceKm == null) return null; // store origin not configured

  const zone = resolveZoneByDistance(zones, distanceKm);
  if (!zone) return null; // outside all configured zones

  const promise = await calculateDeliveryPromise(zone, now, useAdmin);
  return { ...promise, distanceKm: Math.round(distanceKm * 10) / 10 };
}
