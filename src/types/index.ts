export type TransportMode = "walk" | "cycle" | "public" | "car";

export interface UserProfile {
    name: string;
    onboardingCompleted: boolean;
}

export interface DailyEntry {
    id: string;
    date: string; // ISO date string YYYY-MM-DD
    timestamp: number;

    // Health
    sleep: number; // 0-10
    energy: number; // 0-10
    mood: number; // 0-10

    // Lifestyle
    transport: TransportMode;

    // Calculated
    wellnessScore: number;
    co2Emitted: number; // kg
}

export interface MissionState {
    id: string;
    title: string;
    targetCount: number; // e.g. 3 rides
    currentCount: number;
    completed: boolean;

    weekStartTimestamp: number; // For weekly reset logic

    // Stats
    totalEnergyGained: number; // percentage points sum
    totalCo2Saved: number; // kg sum
}
