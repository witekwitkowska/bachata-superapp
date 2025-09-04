// Leaflet configuration for free mapping
export const LEAFLET_CONFIG = {
  // Barcelona coordinates as default center
  defaultCenter: {
    lng: 2.1734,
    lat: 41.3851,
  },

  // Default zoom level
  defaultZoom: 12,

  // Map container style
  mapStyle: {
    width: "100%",
    height: "300px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },

  // Free tile layer options
  tileLayers: {
    openstreetmap: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      name: "OpenStreetMap"
    },
    cartoLight: {
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      name: "Carto Light"
    },
    stamenToner: {
      url: "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png",
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      name: "Stamen Toner"
    },
    stamenTerrain: {
      url: "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png",
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      name: "Stamen Terrain"
    }
  },

  // Default tile layer
  defaultTileLayer: "openstreetmap"
};

// Helper function to validate coordinates
export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
}

// Helper function to format coordinates for display
export function formatCoordinates(
  lat: number,
  lng: number,
  precision: number = 6
): string {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
}

// Helper function to get address from coordinates (reverse geocoding)
// Using free Nominatim service from OpenStreetMap
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    // Using Nominatim (free OpenStreetMap geocoding service)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BachataSuperApp/1.0' // Required by Nominatim
        }
      }
    );

    if (!response.ok) {
      throw new Error("Geocoding request failed");
    }

    const data = await response.json();

    if (data && data.display_name) {
      return data.display_name;
    }

    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}
