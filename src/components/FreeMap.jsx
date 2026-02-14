import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet'
import { useState } from 'react'
import axios from 'axios'
import L from 'leaflet'

// Using a demo key or prompt user
const ORS_KEY = "5b3ce3597851110001cf6248c8b6d4328b5f4839a6a64ecb684145b8" // This is a real-looking key format

const markerIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

function MapEvents({ onClick }) {
    useMapEvents({
        click: onClick,
    })
    return null
}

export default function FreeMap({ onDistance }) {
    const [start, setStart] = useState(null)
    const [end, setEnd] = useState(null)
    const [route, setRoute] = useState([])
    const [loading, setLoading] = useState(false)

    async function handleClick(e) {
        if (!start) {
            setStart(e.latlng)
            return
        }

        if (!end) {
            setEnd(e.latlng)
            setLoading(true)

            try {
                const res = await axios.post(
                    "http://localhost:5000/route",
                    {
                        coordinates: [
                            [start.lng, start.lat],
                            [e.latlng.lng, e.latlng.lat],
                        ],
                    }
                )

                const coords = res.data.features[0].geometry.coordinates.map(
                    ([lng, lat]) => [lat, lng]
                )

                setRoute(coords)
                const km = res.data.features[0].properties.summary.distance / 1000
                onDistance(km)
            } catch (error) {
                console.error("Routing error:", error)
                // Fallback or alert
            } finally {
                setLoading(false)
            }
        } else {
            // Reset if already has a route
            setStart(e.latlng)
            setEnd(null)
            setRoute([])
            onDistance(null)
        }
    }

    return (
        <div className="h-[420px] rounded-2xl overflow-hidden border border-[var(--color-border)] relative shadow-2xl">
            <MapContainer
                center={[23.0225, 72.5714]}
                zoom={13}
                className="h-full w-full z-0"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapEvents onClick={handleClick} />

                {start && <Marker position={start} icon={markerIcon} />}
                {end && <Marker position={end} icon={markerIcon} />}
                {route.length > 0 && (
                    <Polyline
                        positions={route}
                        pathOptions={{ color: 'var(--color-eco)', weight: 4 }}
                    />
                )}
            </MapContainer>

            {loading && (
                <div className="absolute inset-0 z-10 bg-[var(--color-bg)]/40 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="p-4 rounded-xl glass-premium text-sm font-bold animate-pulse">
                        Calculating Route...
                    </div>
                </div>
            )}

            {!start && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full glass-premium text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-text)] shadow-xl pointer-events-none whitespace-nowrap">
                    Click Map to Set Start Point
                </div>
            )}
            {start && !end && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full glass-premium text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] shadow-xl pointer-events-none whitespace-nowrap animate-pulse">
                    Click Map to Set Destination
                </div>
            )}
        </div>
    )
}
