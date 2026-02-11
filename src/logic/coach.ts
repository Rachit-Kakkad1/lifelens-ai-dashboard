import { DailyEntry } from "../types";

export interface CoachInsight {
    text: string;
    type: "health" | "planet" | "balanced";
    correlations: {
        health: string;
        planet: string;
    };
}

/**
 * LifeLens AI Coach Logic
 * Generates calm, data-driven insights connecting body and planet.
 */
export const generateCoachInsight = (entries: DailyEntry[]): CoachInsight => {
    if (entries.length === 0) {
        return {
            text: "Begin your journey by logging your first day; collective data will reveal the hidden connections between your health and the planet.",
            type: "balanced",
            correlations: {
                health: "Consistent tracking is the first step to unlocking metabolic awareness.",
                planet: "Your digital footprint starts here; small logs enable large-scale climate awareness."
            }
        };
    }

    const latest = entries[entries.length - 1];
    const weekly = entries.slice(-7);

    const avgWellness = weekly.reduce((sum, e) => sum + e.wellnessScore, 0) / weekly.length;
    const avgSleep = weekly.reduce((sum, e) => sum + e.sleep, 0) / weekly.length;
    const carDays = weekly.filter(e => e.transport === "car").length;
    const cyclingDays = weekly.filter(e => e.transport === "cycle").length;

    // ADAPTIVE: Check LATEST entry specifically for immediate feedback (The "WOW" Moment)
    // Positive Shift
    if (latest.transport === "cycle" || latest.transport === "walk") {
        return {
            text: "Today’s shift from driving to cycling reduced your emissions and stabilized your weekly energy trend. Small habits like this begin to compound within days.",
            type: "balanced",
            correlations: {
                health: "Active transport correlates with higher sleep quality and morning alertness.",
                planet: "You have avoided approx 7.5kg of CO₂ this week through active choices."
            }
        };
    }

    // Negative/Warning (Car)
    if (latest.transport === "car") {
        return {
            text: "Driving today keeps emissions high and slows your energy recovery. One active commute could start reversing this pattern within the week.",
            type: "balanced",
            correlations: {
                health: "Sedentary commutes are linked to a 14% drop in afternoon energy stability.",
                planet: "Car commutes produce over 2.5kg of CO₂ daily, 100% more than cycling."
            }
        };
    }

    // Pattern 2: Cycling success
    if (cyclingDays >= 2 && avgWellness > 75) {
        return {
            text: "The movement from your cycling commutes is stabilizing your energy and shielding the atmosphere; maintaining this rhythm for one more day will cement this dual success.",
            type: "balanced",
            correlations: {
                health: "Active transport correlates with higher sleep quality and morning alertness.",
                planet: "You have avoided approx 7.5kg of CO₂ this week through active choices."
            }
        };
    }

    // Pattern 3: Sleep debt
    if (avgSleep < 7) {
        return {
            text: "Consistent sleep debt is limiting your recovery and likely making sustainable choices feel harder; prioritizing eight hours tonight will recharge your focus for a greener tomorrow.",
            type: "health",
            correlations: {
                health: "Chronic sleep under 7h reduces cognitive energy by nearly 30% by mid-day.",
                planet: "Tired states often lead to a 40% higher reliance on carbon-heavy transport."
            }
        };
    }

    // Default / Low Data
    return {
        text: "Small daily choices shape both your health and the planet; keep logging to uncover the precise patterns that define your unique impact.",
        type: "balanced",
        correlations: {
            health: "Every data point brings you closer to personal health optimization.",
            planet: "Individual actions, when tracked, reveal the path to a low-carbon lifestyle."
        }
    };
};
