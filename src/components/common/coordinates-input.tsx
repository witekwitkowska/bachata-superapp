"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Map as MapIcon, Globe } from "lucide-react";
import { toast } from "sonner";
import { LEAFLET_CONFIG, isValidCoordinate, formatCoordinates, reverseGeocode } from "@/lib/leaflet";
import { SimpleMap } from "./simple-map";

interface CoordinatesInputProps {
    value?: { lat: number; lng: number } | null;
    onChange: (value: { lat: number; lng: number } | null) => void;
    label?: string;
    required?: boolean;
    showMap?: boolean;
    center?: { lat: number; lng: number };
    zoom?: number;
    tileLayer?: keyof typeof LEAFLET_CONFIG.tileLayers;
}

export function CoordinatesInput({
    value,
    onChange,
    label = "Coordinates",
    required = false,
    showMap = true,
    center = LEAFLET_CONFIG.defaultCenter,
    zoom = LEAFLET_CONFIG.defaultZoom,
    tileLayer = LEAFLET_CONFIG.defaultTileLayer as keyof typeof LEAFLET_CONFIG.tileLayers
}: CoordinatesInputProps) {
    const [lat, setLat] = useState(value?.lat?.toString() || "");
    const [lng, setLng] = useState(value?.lng?.toString() || "");
    const [showMapView, setShowMapView] = useState(showMap);
    const [address, setAddress] = useState<string | null>(null);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newLat = e.target.value;
        setLat(newLat);

        if (newLat && lng) {
            const latNum = parseFloat(newLat);
            const lngNum = parseFloat(lng);
            if (!isNaN(latNum) && !isNaN(lngNum)) {
                onChange({ lat: latNum, lng: lngNum });
            }
        } else if (!newLat && !lng) {
            onChange(null);
        }
    };

    const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newLng = e.target.value;
        setLng(newLng);

        if (lat && newLng) {
            const latNum = parseFloat(lat);
            const lngNum = parseFloat(newLng);
            if (!isNaN(latNum) && !isNaN(lngNum)) {
                onChange({ lat: latNum, lng: lngNum });
            }
        } else if (!lat && !newLng) {
            onChange(null);
        }
    };

    // Handle map click to set coordinates
    const handleMapClick = useCallback((lat: number, lng: number) => {
        if (isValidCoordinate(lat, lng)) {
            setLat(lat.toString());
            setLng(lng.toString());
            onChange({ lat, lng });
            fetchAddress(lat, lng);
        }
    }, [onChange]);

    // Fetch address from coordinates
    const fetchAddress = useCallback(async (lat: number, lng: number) => {
        setIsLoadingAddress(true);
        try {
            const addr = await reverseGeocode(lat, lng);
            setAddress(addr);
        } catch (error) {
            console.error("Error fetching address:", error);
        } finally {
            setIsLoadingAddress(false);
        }
    }, []);

    // Update coordinates and fetch address
    const updateCoordinates = useCallback((newLat: number, newLng: number) => {
        if (isValidCoordinate(newLat, newLng)) {
            onChange({ lat: newLat, lng: newLng });
            fetchAddress(newLat, newLng);
        }
    }, [onChange, fetchAddress]);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by this browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLat(latitude.toString());
                setLng(longitude.toString());
                updateCoordinates(latitude, longitude);
                toast.success("Location detected successfully!");
            },
            (error) => {
                toast.error("Unable to get your location");
                console.error("Geolocation error:", error);
            }
        );
    };

    const clearCoordinates = () => {
        setLat("");
        setLng("");
        setAddress(null);
        onChange(null);
    };

    useEffect(() => {
        if (value && isValidCoordinate(value.lat, value.lng)) {
            fetchAddress(value.lat, value.lng);
        }
    }, [value, fetchAddress]);

    return (
        <div className="space-y-3">
            <Label className="text-sm font-medium">
                {label}{required && " *"}
            </Label>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
                <div className="space-y-1">
                    <Label htmlFor="lat" className="text-xs text-muted-foreground">
                        Latitude
                    </Label>
                    <Input
                        id="lat"
                        type="number"
                        step="any"
                        placeholder="e.g., 41.3851"
                        value={lat}
                        onChange={handleLatChange}
                        className="text-sm"
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="lng" className="text-xs text-muted-foreground">
                        Longitude
                    </Label>
                    <Input
                        id="lng"
                        type="number"
                        step="any"
                        placeholder="e.g., 2.1734"
                        value={lng}
                        onChange={handleLngChange}
                        className="text-sm"
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    className="flex items-center gap-2 text-xs"
                >
                    <Navigation className="h-3 w-3" />
                    Use Current Location
                </Button>

                {showMap && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMapView(!showMapView)}
                        className="flex items-center gap-2 text-xs"
                    >
                        <MapIcon className="h-3 w-3" />
                        {showMapView ? "Hide Map" : "Show Map"}
                    </Button>
                )}
                {(lat || lng) && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearCoordinates}
                        className="text-xs"
                    >
                        Clear
                    </Button>
                )}
            </div>

            {/* Map Component */}
            {showMapView && (
                <SimpleMap
                    center={value || center}
                    zoom={zoom}
                    value={value}
                    onMapClick={handleMapClick}
                    tileLayer={tileLayer}
                />
            )}

            {/* Address Display */}
            {address && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span className="truncate">{address}</span>
                </div>
            )}

            {/* Coordinates Display */}
            {value && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                        {formatCoordinates(value.lat, value.lng)}
                    </span>
                </div>
            )}

            {/* Loading indicator for address */}
            {isLoadingAddress && (
                <div className="text-xs text-muted-foreground">
                    Loading address...
                </div>
            )}
        </div>
    );
}
