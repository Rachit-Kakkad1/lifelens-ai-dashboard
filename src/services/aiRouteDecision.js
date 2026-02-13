
const LM_STUDIO_URL = 'http://127.0.0.1:1234/v1/chat/completions'

export async function getRouteDecision(distanceKm) {
    try {
        const res = await fetch(LM_STUDIO_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "liquid/lfm2.5-1.2b", // Matches previous ai.js model
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a climate mobility expert. Recommend the best transport mode for lowest CO2. Keep under 40 words with numbers.",
                    },
                    {
                        role: "user",
                        content: `Distance is ${distanceKm} km in an urban city.`,
                    },
                ],
                temperature: 0.4,
                max_tokens: 80,
            }),
        });

        if (!res.ok) throw new Error('LM Studio unreachable');

        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? fallback(distanceKm);
    } catch {
        return fallback(distanceKm);
    }
}

function fallback(d) {
    return `Take metro instead of car. Saves ~${(d * 0.2).toFixed(1)} kg CO₂ per trip. Short urban distance with strong public transit efficiency.`;
}
