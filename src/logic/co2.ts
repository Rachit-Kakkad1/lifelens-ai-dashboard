import { TransportMode } from "../types";

// Emission factors in kg CO2 per daily commute (assuming avg 5km)
const CO2_FACTORS: Record<TransportMode, number> = {
    walk: 0,
    cycle: 0,
    public: 0.5,
    car: 2.5
};

/**
 * Calculates daily CO2 emissions based on transport mode.
 * 
 * @param transport - Mode of transport
 * @returns CO2 emissions in kg
 */
export const calculateDailyCO2 = (transport: TransportMode): number => {
    return CO2_FACTORS[transport];
};

/**
 * Returns the potential CO2 savings if switching from car to this mode.
 * @param transport - Mode of transport
 * @returns CO2 savings in kg
 */
export const calculateCO2Savings = (transport: TransportMode): number => {
    const baseline = CO2_FACTORS.car;
    const actual = CO2_FACTORS[transport];
    return Math.max(0, baseline - actual);
};
