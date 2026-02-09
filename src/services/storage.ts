import { DailyEntry, MissionState, UserProfile } from "../types";
import { INITIAL_MISSION } from "../logic/mission";

const STORAGE_KEYS = {
    VERSION: "lifelens_version",
    USER: "lifelens_user",
    ENTRIES: "lifelens_entries",
    MISSION: "lifelens_mission"
};

const CURRENT_VERSION = 1;

export const StorageService = {
    init: () => {
        const version = localStorage.getItem(STORAGE_KEYS.VERSION);
        if (!version || parseInt(version) !== CURRENT_VERSION) {
            // Version mismatch or fresh load - reset
            console.warn("LifeLens storage version mismatch. Resetting data.");
            StorageService.resetData();
        }
    },

    resetData: () => {
        localStorage.clear();
        localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION.toString());
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
            name: "User",
            onboardingCompleted: false
        }));
        localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.MISSION, JSON.stringify(INITIAL_MISSION));
    },

    saveEntry: (entry: DailyEntry) => {
        const entries = StorageService.getEntries();
        // Check if entry for this date already exists?
        // For simplicity, just append. Or replace if same ID/date.
        // Let's filter out same date to avoid dupes
        const filtered = entries.filter(e => e.date !== entry.date);
        filtered.push(entry);
        // Sort by date
        filtered.sort((a, b) => a.timestamp - b.timestamp);

        localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(filtered));
    },

    getEntries: (): DailyEntry[] => {
        const str = localStorage.getItem(STORAGE_KEYS.ENTRIES);
        return str ? JSON.parse(str) : [];
    },

    getMissionState: (): MissionState => {
        const str = localStorage.getItem(STORAGE_KEYS.MISSION);
        return str ? JSON.parse(str) : INITIAL_MISSION;
    },

    saveMissionState: (state: MissionState) => {
        localStorage.setItem(STORAGE_KEYS.MISSION, JSON.stringify(state));
    },

    getUserProfile: (): UserProfile => {
        const str = localStorage.getItem(STORAGE_KEYS.USER);
        return str ? JSON.parse(str) : { name: "User", onboardingCompleted: false };
    },

    saveUserProfile: (profile: UserProfile) => {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
    }
};
