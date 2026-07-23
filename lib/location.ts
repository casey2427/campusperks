import type { College } from "@/types";

export const LOCATION_STORAGE_KEY = "campusperks-nearby-location";
export const LOCATION_MAX_AGE_MS = 30 * 60 * 1000;

export type NearbyLocation = {
  latitude: number;
  longitude: number;
  detectedAt: number;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceBetweenMiles(
  first: { latitude: number; longitude: number },
  second: { latitude: number; longitude: number },
) {
  const earthRadiusMiles = 3958.8;
  const latitudeDifference = toRadians(
    second.latitude - first.latitude,
  );
  const longitudeDifference = toRadians(
    second.longitude - first.longitude,
  );
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  return (
    2 *
    earthRadiusMiles *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function findNearestCollege(
  location: NearbyLocation,
  colleges: College[],
) {
  return colleges
    .map((college) => ({
      college,
      distance: distanceBetweenMiles(location, college),
    }))
    .sort((first, second) => first.distance - second.distance)[0];
}

export function saveNearbyLocation(location: NearbyLocation) {
  try {
    window.sessionStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify(location),
    );
  } catch {
    // Location still works for the current action if storage is unavailable.
  }
}

export function readNearbyLocation(): NearbyLocation | null {
  try {
    const stored = window.sessionStorage.getItem(LOCATION_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as Partial<NearbyLocation>;
    if (
      typeof parsed.latitude !== "number" ||
      typeof parsed.longitude !== "number" ||
      typeof parsed.detectedAt !== "number" ||
      Date.now() - parsed.detectedAt > LOCATION_MAX_AGE_MS
    ) {
      window.sessionStorage.removeItem(LOCATION_STORAGE_KEY);
      return null;
    }

    return parsed as NearbyLocation;
  } catch {
    return null;
  }
}

export function clearNearbyLocation() {
  try {
    window.sessionStorage.removeItem(LOCATION_STORAGE_KEY);
  } catch {
    // No action is required when browser storage is unavailable.
  }
}
