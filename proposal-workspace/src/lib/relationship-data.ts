/**
 * relationship-data.ts
 *
 * Live "together since" math + cosmic / world tickers used by
 * RelationshipMetrics, CountdownToProposal, AuroraRoot and others.
 *
 * All rates are gender-neutral and apply symmetrically to both partners.
 */

// ============= IDENTITIES (gender-neutral) =============
export const USER_NAME = "J";
export const PARTNER_NAME = "Dee";

// ============= BIRTH DATES =============
// User: November 18, 2001
// Dee : May 25, 2001
export const USER_BIRTH = new Date(2001, 10, 18, 7, 30, 0); // Nov 18 2001, 7:30 AM
export const PARTNER_BIRTH = new Date(2001, 4, 25, 6, 15, 0); // May 25 2001, 6:15 AM

// ============= RELATIONSHIP MILESTONES =============
// Met / became a couple on October 4, 2021 at 11:00 AM Eastern Time.
// (EDT = UTC-4 in October, so UTC 15:00)
export const RELATIONSHIP_START = new Date(
  Date.UTC(2021, 9, 4, 15, 0, 0)
);

// The proposal is planned for August 7, 2026 at 7:30 PM Eastern Time.
// (EDT = UTC-4 in early August, so UTC 23:30)
export const PROPOSAL_DATE = new Date(
  Date.UTC(2026, 7, 7, 23, 30, 0)
);

// ============= BIOLOGICAL RATES (per person) =============
export const HEART_BPM = 72; // average resting heartbeats / minute
export const BREATHS_PER_MIN = 14; // average resting breaths / minute
export const BLINKS_PER_DAY = 17000; // average blinks / day

// ============= COSMIC RATES =============
export const LIGHT_SPEED_KM_S = 299792.458; // km / second (exact)
export const VOYAGER_SPEED_KM_S = 17; // Voyager 1 ~17 km/s relative to sun
export const EARTH_ORBITAL_SPEED_KM_S = 29.78; // Earth's mean orbital speed

// ============= WORLD RATES =============
export const BIRTHS_PER_SEC = 4.3; // global births (UN WPP, 2024)
export const DEATHS_PER_SEC = 1.9; // global deaths  (UN WPP, 2024)
export const ISS_ORBITS_PER_DAY = 16; // ISS orbits Earth ~16x / day
export const LIGHTNING_STRIKES_PER_SEC = 44; // global lightning strikes / sec

// ============= DERIVED HELPERS =============

/**
 * breakdownDuration — splits a duration into d / h / m / s components.
 */
export interface DurationBreakdown {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalSeconds: number;
}

export function breakdownDuration(from: Date, to: Date = new Date()): DurationBreakdown {
  const startDate = new Date(from);
  const endDate = new Date(to);
  if (startDate.getTime() > endDate.getTime()) {
    const tmp = startDate;
    startDate.setTime(endDate.getTime());
    endDate.setTime(tmp.getTime());
  }
  const totalMs = endDate.getTime() - startDate.getTime();
  const totalSeconds = Math.floor(totalMs / 1000);
  const totalDays = Math.floor(totalSeconds / 86400);

  // Calendar-aware year/month/day arithmetic.
  let years = endDate.getUTCFullYear() - startDate.getUTCFullYear();
  let months = endDate.getUTCMonth() - startDate.getUTCMonth();
  let days = endDate.getUTCDate() - startDate.getUTCDate();
  let hours = endDate.getUTCHours() - startDate.getUTCHours();
  let minutes = endDate.getUTCMinutes() - startDate.getUTCMinutes();
  let seconds = endDate.getUTCSeconds() - startDate.getUTCSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    // borrow days from previous month
    const prevMonth = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 0));
    days += prevMonth.getUTCDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    totalSeconds,
  };
}

/**
 * formatDistance — human-readable duration like
 *   "4 years, 10 months, 3 days"
 * or "5 months, 12 days" if under a year.
 */
export function formatDistance(from: Date, to: Date = new Date()): string {
  const b = breakdownDuration(from, to);
  const parts: string[] = [];
  if (b.years > 0) parts.push(`${b.years} year${b.years !== 1 ? "s" : ""}`);
  if (b.months > 0) parts.push(`${b.months} month${b.months !== 1 ? "s" : ""}`);
  if (b.days > 0) parts.push(`${b.days} day${b.days !== 1 ? "s" : ""}`);
  if (parts.length === 0) {
    if (b.hours > 0) parts.push(`${b.hours} hour${b.hours !== 1 ? "s" : ""}`);
    if (b.minutes > 0) parts.push(`${b.minutes} minute${b.minutes !== 1 ? "s" : ""}`);
    parts.push(`${b.seconds} second${b.seconds !== 1 ? "s" : ""}`);
  }
  return parts.join(", ");
}

// ============= DERIVED METRIC COMPUTATIONS =============
/**
 * Given a duration in seconds, compute the live cosmic / world counters
 * for both partners combined.
 */
export interface LiveMetrics {
  heartbeatsEach: number;
  heartbeatsCombined: number;
  breathsEach: number;
  breathsCombined: number;
  blinksEach: number;
  blinksCombined: number;
  lightKm: number;
  voyagerKm: number;
  earthOrbitKm: number;
  worldBirths: number;
  worldDeaths: number;
  issOrbits: number;
  lightningStrikes: number;
  netPeople: number;
}

export function computeLiveMetrics(seconds: number): LiveMetrics {
  const heartbeatsEach = Math.floor((seconds / 60) * HEART_BPM);
  const breathsEach = Math.floor((seconds / 60) * BREATHS_PER_MIN);
  const blinksEach = Math.floor((seconds / 86400) * BLINKS_PER_DAY);

  const lightKm = seconds * LIGHT_SPEED_KM_S;
  const voyagerKm = seconds * VOYAGER_SPEED_KM_S;
  const earthOrbitKm = seconds * EARTH_ORBITAL_SPEED_KM_S;

  const worldBirths = Math.floor(seconds * BIRTHS_PER_SEC);
  const worldDeaths = Math.floor(seconds * DEATHS_PER_SEC);
  const issOrbits = (seconds / 86400) * ISS_ORBITS_PER_DAY;
  const lightningStrikes = Math.floor(seconds * LIGHTNING_STRIKES_PER_SEC);

  return {
    heartbeatsEach,
    heartbeatsCombined: heartbeatsEach * 2,
    breathsEach,
    breathsCombined: breathsEach * 2,
    blinksEach,
    blinksCombined: blinksEach * 2,
    lightKm,
    voyagerKm,
    earthOrbitKm,
    worldBirths,
    worldDeaths,
    issOrbits,
    lightningStrikes,
    netPeople: worldBirths - worldDeaths,
  };
}

// ============= NUMBER FORMATTING =============
export function formatCompactNumber(n: number): string {
  if (!isFinite(n)) return "∞";
  const abs = Math.abs(n);
  if (abs >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (abs >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return Math.floor(n).toLocaleString("en-US");
}

export function formatKm(km: number): string {
  if (km >= 1e9) return (km / 1e9).toFixed(2) + " billion km";
  if (km >= 1e6) return (km / 1e6).toFixed(2) + " million km";
  if (km >= 1e3) return (km / 1e3).toFixed(2) + " thousand km";
  return km.toFixed(0) + " km";
}
