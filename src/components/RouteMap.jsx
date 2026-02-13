import { GoogleMap, Polyline, useJsApiLoader } from "@react-google-maps/api";

const center = { lat: 23.0225, lng: 72.5714 }; // Ahmedabad example

const path = [
    { lat: 23.0225, lng: 72.5714 },
    { lat: 23.0350, lng: 72.5800 },
];

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.75rem' // rounded-xl check
};

export default function RouteMap() {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
    });

    if (!isLoaded) return (
        <div className="w-full h-64 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] animate-pulse">
            Loading map...
        </div>
    );

    return (
        <GoogleMap
            zoom={13}
            center={center}
            mapContainerClassName="w-full h-full rounded-xl"
            mapContainerStyle={containerStyle}
            options={{
                disableDefaultUI: true,
                styles: [
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
                ]
            }}
        >
            <Polyline path={path} options={{ strokeColor: "#22c55e", strokeWeight: 4 }} />
        </GoogleMap>
    );
}
