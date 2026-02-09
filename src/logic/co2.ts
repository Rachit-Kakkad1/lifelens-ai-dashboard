import { TransportMode } from "../types";

/**
 * Emission factors in kg CO2 per daily commute
 */
const CO2_FACTORS: Record<TransportMode, number> = {
    walk: 0,
    cycle: 0,
    public: 0.5,
    car: 2.5
};

export const calculateDailyCO2 = (transport: TransportMode): number => {
    return CO2_FACTORS[transport];
};

export const calculateCO2Savings = (transport: TransportMode): number => {
    const baseline = CO2_FACTORS.car;
    const actual = CO2_FACTORS[transport];
    return Math.max(0, baseline - actual);
};

/**
 * Sustainability Score Logic
 * Balanced against Wellness (0-100 scale)
 * 20kg/week is the "Low sustainability" threshold for this personal metric.
 */
export const calculateSustainabilityScore = (weeklyCo2Sum: number): number => {
    const threshold = 20;
    const score = 100 - (weeklyCo2Sum / threshold * 100);
    return Math.max(0, Math.min(100, Math.round(score)));
};
