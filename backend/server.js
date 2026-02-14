const express = require("express")
const axios = require("axios")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

// Protected API Key on Server Side
const ORS_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjA4ZDEyYmRmZDk1MjQzNzNiNTJmZGY1NTJhOTg2NDA1IiwiaCI6Im11cm11cjY0In0="

// Helper for Haversine distance (Fallback)
function calculateHaversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

app.post("/route", async (req, res) => {
    const { coordinates } = req.body;
    if (!coordinates || coordinates.length < 2) {
        return res.status(400).json({ error: "Missing coordinates" });
    }
    const [start, end] = coordinates;

    try {
        const response = await axios.post(
            "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
            req.body,
            {
                headers: {
                    Authorization: ORS_KEY,
                    "Content-Type": "application/json",
                },
                timeout: 5000
            }
        )

        res.json(response.data)
    } catch (err) {
        console.warn("ORS API Failed. Using Demo Fallback...");

        // Haversine fallback
        const dist = calculateHaversine(start[1], start[0], end[1], end[0]) * 1.2;

        res.json({
            type: "FeatureCollection",
            features: [{
                geometry: {
                    type: "LineString",
                    coordinates: [start, end]
                },
                properties: {
                    summary: { distance: dist * 1000 }
                }
            }]
        });
    }
})

// LM Studio Proxy to avoid CORS
app.post("/ai", async (req, res) => {
    try {
        const response = await axios.post(
            "http://localhost:1234/v1/chat/completions",
            req.body,
            { timeout: 10000 }
        )
        res.json(response.data)
    } catch (err) {
        console.error("LM Studio Proxy Error:", err.message)
        res.status(500).json({ error: "LM Studio connection failed" })
    }
})

app.listen(5000, () => console.log("Backend running on http://localhost:5000"))
