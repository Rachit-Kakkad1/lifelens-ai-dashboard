import { GoogleMap, Polyline, DirectionsRenderer } from "@react-google-maps/api";
import { useMemo } from 'react';

const center = { lat: 23.0225, lng: 72.5714 }; // Ahmedabad example

const fixedPath = [
    { lat: 23.0225, lng: 72.5714 },
    { lat: 23.0350, lng: 72.5800 },
];

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.75rem',
    backgroundColor: '#1f2937' // Fallback color
};

const darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
];

export default function RouteMap({ isLoaded, directions }) {
    const mapOptions = useMemo(() => ({
        disableDefaultUI: true,
        styles: darkMapStyles,
    }), []);

    if (!isLoaded) return (
        <div className="w-full h-full rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] animate-pulse">
            Loading map engine...
        </div>
    );

    return (
        <GoogleMap
            zoom={13}
            center={center}
            mapContainerStyle={containerStyle}
            options={mapOptions}
        >
            {directions ? (
                <DirectionsRenderer
                    directions={directions}
                    options={{
                        polylineOptions: { strokeColor: "#22c55e", strokeWeight: 5 }
                    }}
                />
            ) : (
                <Polyline path={fixedPath} options={{ strokeColor: "#22c55e", strokeWeight: 4, strokeOpacity: 0.8 }} />
            )}
        </GoogleMap>
    );
}
