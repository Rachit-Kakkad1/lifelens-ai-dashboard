import { MissionState, TransportMode } from "../types";
import { calculateCO2Savings } from "./co2";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const INITIAL_MISSION: MissionState = {
    id: "cycle-commute-1",
    title: "Cycle to work 3x this week",
    targetCount: 3,
    currentCount: 0,
    completed: false,
    weekStartTimestamp: Date.now(),
    totalEnergyGained: 0,
    totalCo2Saved: 0
};

/**
 * Checks if the mission week has passed and resets if necessary.
 */
export const checkAndResetMissionWeek = (mission: MissionState): MissionState => {
    const now = Date.now();
    const weekDiff = now - mission.weekStartTimestamp;

    if (weekDiff >= ONE_WEEK_MS) {
        // Reset for new week, but keep total stats? 
        // Requirement says "persistence of weekly success", "reset logic for next week".
        // We'll reset current count and completion, update timestamp.
        return {
            ...mission,
            weekStartTimestamp: now,
            currentCount: 0,
            completed: false
            // totals accumulate over time? 
            // "persistence of weekly success" implies we might want to log history, but for this simpler logic
            // let's assume we just reset the active tracking.
        };
    }

    return mission;
};

/**
 * Updates mission state based on a new daily entry.
 */
export const updateMissionProgress = (
    mission: MissionState,
    transport: TransportMode,
    energyLevel: number
): MissionState => {
    // First check for weekly reset
    let nextMission = checkAndResetMissionWeek(mission);

    // Calculate impacts
    // Energy gain: "ridesCompleted * 6" per spec. 
    // We'll just add 6% per ride for simplicity in total tracking, 
    // though existing logic implies this is a derived display value.
    // Let's accumulate it.

    let didMakeProgress = false;

    if (transport === "cycle") {
        // Only count if not already completed for the week? 
        // Or allow over-achievement? Spec says "When mission reaches 100%: Trigger completion".
        // Let's cap it at completion for the "currentCount" logical check, but allow stats to grow.

        didMakeProgress = true;
        nextMission.totalCo2Saved += calculateCO2Savings("cycle"); // 2.5kg saved
        nextMission.totalEnergyGained += 6; // +6% energy

        if (!nextMission.completed) {
            nextMission.currentCount += 1;
            if (nextMission.currentCount >= nextMission.targetCount) {
                nextMission.completed = true;
            }
        }
    }

    return nextMission;
};
