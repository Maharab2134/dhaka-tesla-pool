export interface DhakaArea {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zone: string;
}

export const DHAKA_AREAS: Record<string, DhakaArea> = {
  Banani: {
    id: "banani",
    name: "Banani",
    lat: 23.7937,
    lng: 90.4066,
    zone: "NORTH",
  },
  "Gulshan 1": {
    id: "gulshan-1",
    name: "Gulshan 1",
    lat: 23.7785,
    lng: 90.4184,
    zone: "NORTH",
  },
  "Gulshan 2": {
    id: "gulshan-2",
    name: "Gulshan 2",
    lat: 23.7925,
    lng: 90.4162,
    zone: "NORTH",
  },
  Mohakhali: {
    id: "mohakhali",
    name: "Mohakhali",
    lat: 23.7776,
    lng: 90.4005,
    zone: "CENTRAL",
  },
  Farmgate: {
    id: "farmgate",
    name: "Farmgate",
    lat: 23.757,
    lng: 90.3892,
    zone: "CENTRAL",
  },
  Dhanmondi: {
    id: "dhanmondi",
    name: "Dhanmondi",
    lat: 23.7465,
    lng: 90.376,
    zone: "SOUTH_CENTRAL",
  },
  "Mirpur 10": {
    id: "mirpur-10",
    name: "Mirpur 10",
    lat: 23.8069,
    lng: 90.3687,
    zone: "WEST",
  },
  Uttara: {
    id: "uttara",
    name: "Uttara",
    lat: 23.8759,
    lng: 90.3795,
    zone: "NORTH_OUTSKIRTS",
  },
  Bashundhara: {
    id: "bashundhara",
    name: "Bashundhara",
    lat: 23.8151,
    lng: 90.4255,
    zone: "EAST",
  },
};

export const isValidDhakaArea = (areaName: string): boolean => {
  return Object.prototype.hasOwnProperty.call(DHAKA_AREAS, areaName);
};

export const getDhakaArea = (areaName: string): DhakaArea | undefined => {
  return DHAKA_AREAS[areaName];
};

// Calculate Haversine distance in kilometers between two Dhaka locations
export const calculateDistanceKm = (
  pickup: DhakaArea,
  destination: DhakaArea
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((destination.lat - pickup.lat) * Math.PI) / 180;
  const dLng = ((destination.lng - pickup.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pickup.lat * Math.PI) / 180) *
      Math.cos((destination.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawDistance = R * c;

  // Multiply by road circuit factor ~1.3 to simulate realistic Dhaka street navigation
  return Math.max(1.0, Math.round(rawDistance * 1.3 * 10) / 10);
};
