/**
 * Weekly Action Plan Generator
 * Produces 2-3 personalized action items based on recent behavior data.
 */

const CO2_FACTORS = { walk: 0, cycle: 0, public: 0.5, car: 2.5 }

export function generateWeeklyPlan(entries) {
    if (!entries || entries.length < 2) {
        return {
            actions: [
                { text: 'Start logging daily check-ins', savings: 0, icon: 'clipboard' },
            ],
            totalPotential: 0,
        }
    }

    const actions = []
    const recent = entries.slice(-7)

    // --- Transport analysis ---
    const carTrips = recent.filter(e => e.transport === 'car').length
    const publicTrips = recent.filter(e => e.transport === 'public').length
    const cycleTrips = recent.filter(e => e.transport === 'cycle').length
    const walkTrips = recent.filter(e => e.transport === 'walk').length

    if (carTrips >= 2) {
        const savingsPerTrip = CO2_FACTORS.car - CO2_FACTORS.cycle
        const tripsToSwitch = Math.min(carTrips, 2)
        actions.push({
            text: `Bike commute ${tripsToSwitch === 1 ? 'once' : 'twice'} instead of driving`,
            savings: parseFloat((savingsPerTrip * tripsToSwitch).toFixed(1)),
            icon: 'bike',
        })
    }

    if (carTrips >= 1) {
        actions.push({
            text: 'Skip one car trip → use transit or walk',
            savings: parseFloat((CO2_FACTORS.car - CO2_FACTORS.public).toFixed(1)),
            icon: 'bus',
        })
    }

    // --- Sleep analysis ---
    const avgSleep = recent.reduce((s, e) => s + (e.sleep || 7), 0) / recent.length
    if (avgSleep < 7) {
        actions.push({
            text: 'Aim for 7+ hours sleep → boosts energy for active commutes',
            savings: 1.2,
            icon: 'moon',
        })
    }

    // --- Mood / energy analysis ---
    const avgEnergy = recent.reduce((s, e) => s + (e.energy || 6), 0) / recent.length
    if (avgEnergy < 6 && cycleTrips === 0) {
        actions.push({
            text: 'Try one cycle commute → +15% energy boost observed',
            savings: 2.5,
            icon: 'zap',
        })
    }

    // If we still have few actions, add a maintenance one
    if (actions.length < 2 && (cycleTrips + walkTrips) >= 3) {
        actions.push({
            text: 'Maintain your active streak → you\'re in the green zone!',
            savings: 0,
            icon: 'check',
        })
    }

    // Limit to 3 actions
    const finalActions = actions.slice(0, 3)
    const totalPotential = parseFloat(finalActions.reduce((s, a) => s + a.savings, 0).toFixed(1))

    return { actions: finalActions, totalPotential }
}
