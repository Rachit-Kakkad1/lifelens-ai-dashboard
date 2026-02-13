/**
 * AI Predictor – Smart rule-based CO₂ prediction engine.
 * Analyzes user entries to produce:
 *   1. Biggest reduction opportunity
 *   2. Monthly CO₂ savings projection
 *   3. Time to reach sustainable target
 */

const CO2_FACTORS = { walk: 0, cycle: 0, public: 0.5, car: 2.5 }
const SUSTAINABLE_DAILY_TARGET = 0.5 // kg CO₂ per day

export function generatePredictiveInsight(entries) {
    if (!entries || entries.length < 2) {
        return {
            opportunity: 'Log more days to unlock predictive insights.',
            monthlySavings: 0,
            timeToTarget: 'N/A',
            reductionPct: 0,
            currentDaily: 0,
            projectedDaily: 0,
            confidence: 'Low',
        }
    }

    // --- Analyze transport frequency ---
    const freq = { walk: 0, cycle: 0, public: 0, car: 0 }
    entries.forEach(e => { if (freq[e.transport] !== undefined) freq[e.transport]++ })
    const totalDays = entries.length

    // --- Calculate current daily average CO₂ ---
    const totalCo2 = entries.reduce((s, e) => s + (e.co2Emitted || CO2_FACTORS[e.transport] || 0), 0)
    const currentDaily = totalCo2 / totalDays

    // --- Find biggest reduction opportunity ---
    const carDays = freq.car
    const publicDays = freq.public
    let opportunity = ''
    let bestSwitch = ''
    let savingsPerSwitch = 0

    if (carDays > 0) {
        // Switching car trips to cycling is the highest-impact move
        savingsPerSwitch = CO2_FACTORS.car - CO2_FACTORS.cycle
        bestSwitch = 'cycle'
        const pct = Math.round((carDays / totalDays) * 100)
        opportunity = `Switch ${carDays} car trips → cycling (${pct}% of your commutes are high-emission)`
    } else if (publicDays > 0) {
        savingsPerSwitch = CO2_FACTORS.public - CO2_FACTORS.cycle
        bestSwitch = 'cycle'
        opportunity = `Switch ${publicDays} transit trips → cycling for near-zero emissions`
    } else {
        opportunity = 'You\'re already at near-zero transport emissions. Maintain this streak!'
        savingsPerSwitch = 0
    }

    // --- Monthly savings projection ---
    const switchableDays = carDays > 0 ? carDays : publicDays
    const weeklyRate = (switchableDays / totalDays) * 7
    const monthlySavings = parseFloat((weeklyRate * savingsPerSwitch * 4.3).toFixed(1))

    // --- Projected daily CO₂ after switching ---
    const projectedDaily = Math.max(0, currentDaily - (switchableDays > 0 ? (switchableDays * savingsPerSwitch) / totalDays : 0))

    // --- Time to sustainable target ---
    const gap = currentDaily - SUSTAINABLE_DAILY_TARGET
    let timeToTarget = 'Already sustainable!'
    if (gap > 0) {
        const reductionPerWeek = savingsPerSwitch * Math.min(weeklyRate, 3) / 7
        if (reductionPerWeek > 0) {
            const weeksNeeded = Math.ceil(gap / reductionPerWeek)
            timeToTarget = weeksNeeded <= 1 ? '~1 week' : weeksNeeded <= 4 ? `~${weeksNeeded} weeks` : `~${Math.ceil(weeksNeeded / 4)} months`
        } else {
            timeToTarget = 'Explore alternative transport options'
        }
    }

    // --- Reduction percentage ---
    const reductionPct = currentDaily > 0 ? Math.round(((currentDaily - projectedDaily) / currentDaily) * 100) : 0

    // --- Confidence level ---
    const confidence = totalDays >= 14 ? 'High' : totalDays >= 5 ? 'Moderate' : 'Low'

    return {
        opportunity,
        monthlySavings,
        timeToTarget,
        reductionPct,
        currentDaily: parseFloat(currentDaily.toFixed(1)),
        projectedDaily: parseFloat(projectedDaily.toFixed(1)),
        confidence,
        bestSwitch,
    }
}
