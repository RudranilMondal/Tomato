// Google Maps Platform Integration Loader & Geocoding Utilities
// Uses device GPS coordinates and Google Maps Geocoding API (Strict, No Fake IP fallback)

declare global {
  interface Window {
    google?: any;
    initTomatttoMap?: () => void;
  }
}

export interface GpsCoordinates {
  lat: number;
  lng: number;
}

export interface GeocodedAddressResult {
  formattedAddress: string;
  flatBuilding: string;
  areaStreet: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: GpsCoordinates;
}

let googleMapsPromise: Promise<boolean> | null = null;

export function loadGoogleMapsScript(libraries: string[] = ['places', 'geometry']): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.google && window.google.maps) return Promise.resolve(true);

  if (googleMapsPromise) return googleMapsPromise;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('[GoogleMaps] VITE_GOOGLE_MAPS_API_KEY is not defined.');
    return Promise.resolve(false);
  }

  googleMapsPromise = new Promise((resolve) => {
    const callbackName = 'initTomatttoMap';
    window.initTomatttoMap = () => {
      resolve(true);
      delete window.initTomatttoMap;
    };

    const script = document.createElement('script');
    const libs = libraries.join(',');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=${libs}&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.warn('[GoogleMaps] Failed to load Google Maps script.');
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export function isGoogleMapsLoaded(): boolean {
  return typeof window !== 'undefined' && Boolean(window.google && window.google.maps);
}

// Retrieve current device GPS coordinates directly via browser HTML5 Geolocation API
// Explicitly prompts user for permission if not yet decided
export function getCurrentGpsLocation(): Promise<GpsCoordinates> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser or device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => {
        let msg = 'Failed to retrieve GPS location.';
        if (err.code === 1) {
          msg =
            'Location permission was denied. Please allow location access: click the lock/settings icon 🔒 in your browser address bar and set Location to "Allow".';
        } else if (err.code === 2) {
          msg =
            'GPS position unavailable. On Mac: please open System Settings > Privacy & Security > Location Services and ensure Location is enabled for your browser and Wi-Fi is active.';
        } else if (err.code === 3) {
          msg = 'Location request timed out. Please click again to retry.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 // Request fresh GPS fix without stale cache
      }
    );
  });
}

function parseGoogleGeocodeResult(result: any, lat: number, lng: number): GeocodedAddressResult {
  const components: any[] = result.address_components || [];

  const getComp = (...types: string[]) => {
    const found = components.find((c) => types.some((t) => c.types.includes(t)));
    return found ? found.long_name : '';
  };

  const premise = getComp('premise', 'subpremise', 'street_number');
  const route = getComp('route');
  const sublocality3 = getComp('sublocality_level_3');
  const sublocality2 = getComp('sublocality_level_2');
  const sublocality1 = getComp('sublocality_level_1', 'sublocality');
  const locality = getComp('locality', 'postal_town');
  const city = locality || getComp('administrative_area_level_2');
  const state = getComp('administrative_area_level_1');
  const pincode = getComp('postal_code');
  const landmark = getComp('point_of_interest', 'establishment');

  // Flat / House / Building Number
  const flatBuilding = premise || (result.formatted_address ? result.formatted_address.split(',')[0].trim() : '');

  // Street / Area / Locality
  const areaParts = [route, sublocality3, sublocality2, sublocality1, locality].filter(Boolean);
  const uniqueAreaParts = Array.from(new Set(areaParts));
  const areaStreet =
    uniqueAreaParts.length > 0
      ? uniqueAreaParts.join(', ') + (pincode ? ` - ${pincode}` : '')
      : result.formatted_address || '';

  return {
    formattedAddress: result.formatted_address || `${flatBuilding ? flatBuilding + ', ' : ''}${areaStreet}`,
    flatBuilding,
    areaStreet,
    landmark,
    city,
    state,
    pincode,
    coordinates: { lat, lng }
  };
}

// Reverse-geocode GPS coordinates into an exact address via Google Maps Geocoding API
export async function reverseGeocodeWithGoogle(lat: number, lng: number): Promise<GeocodedAddressResult> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GOOGLE_MAPS_API_KEY is not configured in .env.');
  }

  // 1. Try Google Maps JavaScript Geocoder (runs in browser without CORS)
  try {
    const isLoaded = await loadGoogleMapsScript();
    if (isLoaded && window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response?.results && response.results.length > 0) {
        return parseGoogleGeocodeResult(response.results[0], lat, lng);
      }
    }
  } catch (sdkErr) {
    console.warn('[GoogleMaps] JavaScript Geocoder error, attempting direct REST:', sdkErr);
  }

  // 2. Fetch directly via Google Maps Geocoding REST API
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${encodeURIComponent(
    apiKey
  )}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status === 'OK' && data.results && data.results.length > 0) {
    return parseGoogleGeocodeResult(data.results[0], lat, lng);
  }

  throw new Error(data.error_message || `Google Geocoding failed: ${data.status}`);
}

// Detect exact address using device GPS coordinates and Google Maps Geocoding
export async function detectAddressFromGps(): Promise<GeocodedAddressResult> {
  const coords = await getCurrentGpsLocation();
  return await reverseGeocodeWithGoogle(coords.lat, coords.lng);
}
