"use client";

import { useState, useEffect, useRef } from "react";
import { LEAFLET_CONFIG, formatCoordinates } from "@/lib/leaflet";

interface SimpleMapProps {
    center: { lat: number; lng: number };
    zoom?: number;
    value?: { lat: number; lng: number } | null;
    onMapClick?: (lat: number, lng: number) => void;
    tileLayer?: keyof typeof LEAFLET_CONFIG.tileLayers;
}

export function SimpleMap({
    center,
    zoom = 13,
    value,
    onMapClick,
    tileLayer = "openstreetmap"
}: SimpleMapProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [mapInstance, setMapInstance] = useState<any>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const [currentTileLayer, setCurrentTileLayer] = useState(tileLayer);
    // Debug logging
    useEffect(() => {
        console.log('SimpleMap mounted/updated:', { center, value, tileLayer });
        return () => {
            console.log('SimpleMap unmounting');
        };
    }, [center, value, tileLayer]);

    // Load map only once when component mounts
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadMap = async () => {
            try {
                console.log('Loading map...', { center, value, currentTileLayer });

                // Import Leaflet CSS
                require('leaflet/dist/leaflet.css');

                // Import Leaflet
                const L = require('leaflet');

                // Fix default markers
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
                    iconUrl: require('leaflet/dist/images/marker-icon.png'),
                    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
                });

                if (mapRef.current) {
                    console.log('Creating map instance...');

                    // Create a fresh div element to avoid DOM reuse issues
                    const mapContainer = document.createElement('div');
                    mapContainer.style.height = '300px';
                    mapContainer.style.width = '100%';
                    mapContainer.style.borderRadius = '8px';
                    mapContainer.style.border = '1px solid #e5e7eb';

                    // Clear the ref and add the new container
                    mapRef.current.innerHTML = '';
                    mapRef.current.appendChild(mapContainer);

                    // Create map instance on the fresh container
                    const map = L.map(mapContainer, {
                        center: [center.lat, center.lng],
                        zoom: value ? 15 : zoom,
                        zoomControl: true,
                        attributionControl: true
                    });

                    // Add tile layer
                    const tileLayerConfig = LEAFLET_CONFIG.tileLayers[currentTileLayer];
                    L.tileLayer(tileLayerConfig.url, {
                        attribution: tileLayerConfig.attribution
                    }).addTo(map);

                    // Add marker if value exists
                    let marker: any = null;
                    if (value) {
                        marker = L.marker([value.lat, value.lng]).addTo(map);
                        marker.bindPopup(`
                            <div>
                                <strong>Selected Location</strong><br />
                                ${formatCoordinates(value.lat, value.lng)}
                            </div>
                        `);
                    }

                    // Add click handler
                    if (onMapClick) {
                        map.on('click', (e: any) => {
                            const { lat, lng } = e.latlng;
                            onMapClick(lat, lng);
                        });
                    }

                    setMapInstance(map);
                    setIsLoaded(true);

                    console.log('Map loaded successfully!');
                } else {
                    console.log('mapRef.current is null');
                }
            } catch (error) {
                console.error('Failed to load map:', error);
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            loadMap();
        }, 100);

        // Cleanup
        return () => {
            clearTimeout(timer);
            if (mapInstance) {
                try {
                    if (mapInstance.remove) {
                        mapInstance.remove();
                    }
                } catch (error) {
                    console.log('Error removing map instance:', error);
                }
            }
            setMapInstance(null);
            setIsLoaded(false);
        };
    }, []); // Only run once on mount

    // Update map when value changes
    useEffect(() => {
        if (mapInstance && value) {
            mapInstance.setView([value.lat, value.lng], 15);

            // Remove existing markers
            mapInstance.eachLayer((layer: any) => {
                if (layer instanceof require('leaflet').Marker) {
                    mapInstance.removeLayer(layer);
                }
            });

            // Add new marker
            const L = require('leaflet');
            const marker = L.marker([value.lat, value.lng]).addTo(mapInstance);
            marker.bindPopup(`
                <div>
                    <strong>Selected Location</strong><br />
                    ${formatCoordinates(value.lat, value.lng)}
                </div>
            `);
        }
    }, [value, mapInstance]);

    // Handle tile layer changes
    useEffect(() => {
        if (mapInstance && currentTileLayer !== tileLayer) {
            setCurrentTileLayer(tileLayer);

            // Remove existing tile layers
            mapInstance.eachLayer((layer: any) => {
                if (layer instanceof require('leaflet').TileLayer) {
                    mapInstance.removeLayer(layer);
                }
            });

            // Add new tile layer
            const L = require('leaflet');
            const tileLayerConfig = LEAFLET_CONFIG.tileLayers[tileLayer];
            L.tileLayer(tileLayerConfig.url, {
                attribution: tileLayerConfig.attribution
            }).addTo(mapInstance);
        }
    }, [tileLayer, mapInstance]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                    Click on the map to set location
                </span>
                <select
                    value={currentTileLayer}
                    onChange={(e) => setCurrentTileLayer(e.target.value as keyof typeof LEAFLET_CONFIG.tileLayers)}
                    className="text-xs border rounded px-2 py-1 bg-background"
                >
                    {Object.entries(LEAFLET_CONFIG.tileLayers).map(([key, layer]) => (
                        <option key={key} value={key}>
                            {layer.name}
                        </option>
                    ))}
                </select>
            </div>
            <div
                ref={mapRef}
                style={{
                    height: '300px',
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}
            />
            {!isLoaded && (
                <div className="flex items-center justify-center h-[300px] bg-muted rounded-lg">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Loading map...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
