export async function getAITravelAdvice(distanceKm) {
    try {
        const res = await fetch("http://localhost:5000/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "local-model",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a climate mobility expert. Recommend the lowest carbon transport for a trip. Respond in under 50 words with numbers. Focus on CO2 savings compared to a car.",
                    },
                    {
                        role: "user",
                        content: `Trip distance is ${distanceKm.toFixed(2)} km in an urban city.`,
                    },
                ],
                temperature: 0.4,
                max_tokens: 80,
            }),
        });

        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? fallback(distanceKm);
    } catch (err) {
        console.error("AI Insight Error:", err);
        return fallback(distanceKm);
    }
}

function fallback(d) {
    const savings = (d * 0.16).toFixed(1);
    return `Using metro instead of a car could save approximately ${savings} kg of CO₂ for this ${d.toFixed(1)} km journey. Consider carbon-neutral commute options to reach your 2030 target faster.`;
}
