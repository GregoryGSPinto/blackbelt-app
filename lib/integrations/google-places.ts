// BlackBelt v2 — Google Places API (New) Integration
// Server-only: uses GOOGLE_PLACES_API_KEY.

import { getGooglePlacesKey } from '@/lib/config/api-keys';

// --- Types ---

export interface PlacesSearchParams {
  query: string;
  location?: { lat: number; lng: number };
  radius?: number;
  language?: string;
  maxResults?: number;
}

export interface PlacesSearchResult {
  placeId: string;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
  nota?: number;
  totalAvaliacoes?: number;
  aberto?: boolean;
  tipos: string[];
  fotoRef?: string;
}

export interface PlaceDetails {
  placeId: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  bairro: string;
  cep: string;
  latitude: number;
  longitude: number;
  telefone?: string;
  telefoneInternacional?: string;
  site?: string;
  googleMapsUrl: string;
  nota: number;
  totalAvaliacoes: number;
  horarios: { dia: string; abre: string; fecha: string }[];
  abertoAgora: boolean;
  reviews: { autor: string; nota: number; texto: string; data: string; idioma: string }[];
  fotos: string[];
  tipos: string[];
}

// --- Internal helpers ---

interface GooglePlace {
  id?: string;
  displayName?: { text?: string; languageCode?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  currentOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
    periods?: {
      open?: { day?: number; hour?: number; minute?: number };
      close?: { day?: number; hour?: number; minute?: number };
    }[];
  };
  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
    periods?: {
      open?: { day?: number; hour?: number; minute?: number };
      close?: { day?: number; hour?: number; minute?: number };
    }[];
  };
  types?: string[];
  photos?: { name?: string; widthPx?: number; heightPx?: number; authorAttributions?: { displayName?: string }[] }[];
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  addressComponents?: {
    longText?: string;
    shortText?: string;
    types?: string[];
  }[];
  reviews?: {
    authorAttribution?: { displayName?: string };
    rating?: number;
    text?: { text?: string; languageCode?: string };
    relativePublishTimeDescription?: string;
    publishTime?: string;
  }[];
}

interface GoogleSearchResponse {
  places?: GooglePlace[];
}

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function formatTime(hour?: number, minute?: number): string {
  if (hour === undefined) return '';
  const h = String(hour).padStart(2, '0');
  const m = String(minute ?? 0).padStart(2, '0');
  return `${h}:${m}`;
}

function extractAddressComponent(
  components: GooglePlace['addressComponents'],
  type: string,
): string {
  if (!components) return '';
  const comp = components.find((c) => c.types?.includes(type));
  return comp?.longText ?? comp?.shortText ?? '';
}

// --- Exported Functions ---

/**
 * Returns a photo URL from Google Places Photos API.
 */
export function getPhotoUrl(photoName: string, maxWidth = 400): string {
  const key = getGooglePlacesKey();
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${key}`;
}

/**
 * Text-based place search (focused on gyms/academias).
 */
export async function searchPlaces(params: PlacesSearchParams): Promise<PlacesSearchResult[]> {
  const key = getGooglePlacesKey();

  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.location',
    'places.rating',
    'places.userRatingCount',
    'places.currentOpeningHours',
    'places.types',
    'places.photos',
  ].join(',');

  const body: Record<string, unknown> = {
    textQuery: params.query,
    languageCode: params.language ?? 'pt-BR',
    maxResultCount: params.maxResults ?? 20,
  };

  if (params.location) {
    body.locationBias = {
      circle: {
        center: { latitude: params.location.lat, longitude: params.location.lng },
        radius: params.radius ?? 5000,
      },
    };
  }

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Places searchText failed (${res.status}): ${errorText}`);
  }

  const data: GoogleSearchResponse = await res.json();

  if (!data.places) return [];

  return data.places.map((place) => ({
    placeId: place.id ?? '',
    nome: place.displayName?.text ?? '',
    endereco: place.formattedAddress ?? '',
    latitude: place.location?.latitude ?? 0,
    longitude: place.location?.longitude ?? 0,
    nota: place.rating,
    totalAvaliacoes: place.userRatingCount,
    aberto: place.currentOpeningHours?.openNow,
    tipos: place.types ?? [],
    fotoRef: place.photos?.[0]?.name,
  }));
}

/**
 * Get detailed information about a specific place.
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const key = getGooglePlacesKey();

  const fieldMask = [
    'id',
    'displayName',
    'formattedAddress',
    'addressComponents',
    'location',
    'nationalPhoneNumber',
    'internationalPhoneNumber',
    'websiteUri',
    'googleMapsUri',
    'rating',
    'userRatingCount',
    'currentOpeningHours',
    'regularOpeningHours',
    'reviews',
    'photos',
    'types',
  ].join(',');

  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': fieldMask,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Places getPlaceDetails failed (${res.status}): ${errorText}`);
  }

  const place: GooglePlace = await res.json();

  // Extract address components
  const cidade = extractAddressComponent(place.addressComponents, 'administrative_area_level_2')
    || extractAddressComponent(place.addressComponents, 'locality');
  const estado = extractAddressComponent(place.addressComponents, 'administrative_area_level_1');
  const bairro = extractAddressComponent(place.addressComponents, 'sublocality_level_1')
    || extractAddressComponent(place.addressComponents, 'sublocality');
  const cep = extractAddressComponent(place.addressComponents, 'postal_code');

  // Parse opening hours
  const hours = place.regularOpeningHours ?? place.currentOpeningHours;
  const horarios: PlaceDetails['horarios'] = [];

  if (hours?.periods) {
    for (const period of hours.periods) {
      const dayIndex = period.open?.day ?? 0;
      horarios.push({
        dia: DIAS_SEMANA[dayIndex] ?? `Dia ${dayIndex}`,
        abre: formatTime(period.open?.hour, period.open?.minute),
        fecha: formatTime(period.close?.hour, period.close?.minute),
      });
    }
  }

  // Map reviews
  const reviews: PlaceDetails['reviews'] = (place.reviews ?? []).map((r) => ({
    autor: r.authorAttribution?.displayName ?? 'Anônimo',
    nota: r.rating ?? 0,
    texto: r.text?.text ?? '',
    data: r.relativePublishTimeDescription ?? r.publishTime ?? '',
    idioma: r.text?.languageCode ?? 'pt',
  }));

  // Build photo URLs
  const fotos: string[] = (place.photos ?? [])
    .filter((p) => p.name)
    .slice(0, 5)
    .map((p) => getPhotoUrl(p.name!, 800));

  return {
    placeId: place.id ?? placeId,
    nome: place.displayName?.text ?? '',
    endereco: place.formattedAddress ?? '',
    cidade,
    estado,
    bairro,
    cep,
    latitude: place.location?.latitude ?? 0,
    longitude: place.location?.longitude ?? 0,
    telefone: place.nationalPhoneNumber,
    telefoneInternacional: place.internationalPhoneNumber,
    site: place.websiteUri,
    googleMapsUrl: place.googleMapsUri ?? '',
    nota: place.rating ?? 0,
    totalAvaliacoes: place.userRatingCount ?? 0,
    horarios,
    abertoAgora: hours?.openNow ?? false,
    reviews,
    fotos,
    tipos: place.types ?? [],
  };
}

/**
 * Search for nearby places by coordinates.
 */
export async function searchNearby(
  lat: number,
  lng: number,
  radiusMeters = 5000,
): Promise<PlacesSearchResult[]> {
  const key = getGooglePlacesKey();

  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.location',
    'places.rating',
    'places.userRatingCount',
    'places.currentOpeningHours',
    'places.types',
    'places.photos',
  ].join(',');

  const body = {
    includedTypes: ['gym'],
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radiusMeters,
      },
    },
    languageCode: 'pt-BR',
  };

  const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Places searchNearby failed (${res.status}): ${errorText}`);
  }

  const data: GoogleSearchResponse = await res.json();

  if (!data.places) return [];

  return data.places.map((place) => ({
    placeId: place.id ?? '',
    nome: place.displayName?.text ?? '',
    endereco: place.formattedAddress ?? '',
    latitude: place.location?.latitude ?? 0,
    longitude: place.location?.longitude ?? 0,
    nota: place.rating,
    totalAvaliacoes: place.userRatingCount,
    aberto: place.currentOpeningHours?.openNow,
    tipos: place.types ?? [],
    fotoRef: place.photos?.[0]?.name,
  }));
}
