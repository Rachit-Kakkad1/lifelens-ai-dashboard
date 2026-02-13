/**
 * LM Studio AI Service
 * Connects to LM Studio's local OpenAI-compatible API.
 * Falls back to rule-based logic if the server is unavailable.
 */

const LM_STUDIO_URL = 'http://127.0.0.1:1234/v1/chat/completions'
const LM_STUDIO_MODEL = 'liquid/lfm2.5-1.2b'
const TIMEOUT_MS = 8000

async function callLMStudio(messages, maxTokens = 300) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
        const res = await fetch(LM_STUDIO_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                model: LM_STUDIO_MODEL,
                messages,
                temperature: 0.7,
                max_tokens: maxTokens,
                stream: false,
            }),
        })

        clearTimeout(timeout)

        if (!res.ok) throw new Error(`LM Studio returned ${res.status}`)

        const data = await res.json()
        return data.choices?.[0]?.message?.content?.trim() || null
    } catch (err) {
        clearTimeout(timeout)
        console.warn('[LifeLens AI] LM Studio unavailable, using fallback:', err.message)
        return null
    }
}

/**
 * Generate a predictive CO₂ insight using the LLM.
 * Returns null if AI is unavailable (caller should use rule-based fallback).
 */
export async function getAIPrediction(entries) {
    if (!entries || entries.length < 2) return null

    const recent = entries.slice(-7)
    const summary = recent.map(e =>
        `Day ${e.date}: transport=${e.transport}, CO2=${e.co2Emitted}kg, sleep=${e.sleep?.toFixed(1)}h, energy=${e.energy}, mood=${e.mood}, wellness=${e.wellnessScore}`
    ).join('\n')

    const totalCo2 = recent.reduce((s, e) => s + e.co2Emitted, 0).toFixed(1)
    const carDays = recent.filter(e => e.transport === 'car').length
    const cycleDays = recent.filter(e => e.transport === 'cycle').length

    const messages = [
        {
            role: 'system',
            content: `You are LifeLens AI, a sustainability coach. Analyze the user's recent 7-day behavior data and give a CONCISE predictive insight.

Rules:
- Be specific with numbers (kg CO₂, percentages)
- Focus on their BIGGEST carbon reduction opportunity
- Mention monthly CO₂ savings if they make the change
- Keep it to 2-3 sentences max
- Sound like a smart, data-driven coach
- Do NOT use bullet points or markdown`
        },
        {
            role: 'user',
            content: `Here is my last 7 days of data:\n${summary}\n\nTotal weekly CO₂: ${totalCo2}kg. Car trips: ${carDays}. Cycle trips: ${cycleDays}.\n\nWhat's my biggest CO₂ reduction opportunity and how much could I save monthly?`
        }
    ]

    return await callLMStudio(messages, 200)
}

/**
 * Generate a personalized weekly action plan using the LLM.
 * Returns null if AI is unavailable (caller should use rule-based fallback).
 */
export async function getAIWeeklyPlan(entries) {
    if (!entries || entries.length < 2) return null

    const recent = entries.slice(-7)
    const summary = recent.map(e =>
        `${e.date}: ${e.transport}, CO2=${e.co2Emitted}kg, sleep=${e.sleep?.toFixed(1)}h, energy=${e.energy}`
    ).join('\n')

    const messages = [
        {
            role: 'system',
            content: `You are LifeLens AI. Generate a weekly action plan with exactly 3 specific actions.

Format your response EXACTLY like this (use this exact format, no variations):
ACTION: [action text] | SAVE: [number] kg
ACTION: [action text] | SAVE: [number] kg
ACTION: [action text] | SAVE: [number] kg

Rules:
- Each action must be specific and actionable
- Include realistic CO₂ savings numbers
- Keep action text under 50 characters
- Focus on transport, sleep, and energy patterns`
        },
        {
            role: 'user',
            content: `My recent data:\n${summary}\n\nGive me 3 actions for this week.`
        }
    ]

    return await callLMStudio(messages, 200)
}

/**
 * Parse the AI weekly plan response into structured actions.
 */
export function parseAIWeeklyPlan(aiResponse) {
    if (!aiResponse) return null

    try {
        const lines = aiResponse.split('\n').filter(l => l.includes('ACTION:'))
        const actions = lines.slice(0, 3).map(line => {
            const actionMatch = line.match(/ACTION:\s*(.+?)\s*\|\s*SAVE:\s*([\d.]+)\s*kg/i)
            if (actionMatch) {
                return {
                    text: actionMatch[1].trim(),
                    savings: parseFloat(actionMatch[2]),
                    icon: actionMatch[1].toLowerCase().includes('bike') || actionMatch[1].toLowerCase().includes('cycle') ? 'bike'
                        : actionMatch[1].toLowerCase().includes('walk') ? 'check'
                            : actionMatch[1].toLowerCase().includes('sleep') ? 'moon'
                                : actionMatch[1].toLowerCase().includes('transit') || actionMatch[1].toLowerCase().includes('metro') ? 'bus'
                                    : 'zap',
                }
            }
            return null
        }).filter(Boolean)

        if (actions.length === 0) return null

        return {
            actions,
            totalPotential: parseFloat(actions.reduce((s, a) => s + a.savings, 0).toFixed(1)),
        }
    } catch {
        return null
    }
}

/**
 * Check if LM Studio server is reachable.
 */
export async function checkAIStatus() {
    try {
        const res = await fetch('http://127.0.0.1:1234/v1/models', {
            signal: AbortSignal.timeout(3000),
        })
        if (res.ok) {
            const data = await res.json()
            return {
                online: true,
                model: data.data?.[0]?.id || 'Unknown model',
            }
        }
        return { online: false, model: null }
    } catch {
        return { online: false, model: null }
    }
}
