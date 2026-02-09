
import { calculateWellnessScore } from '../logic/wellness';
import { calculateDailyCO2 } from '../logic/co2';
import { updateMissionProgress, INITIAL_MISSION } from '../logic/mission';
import { StorageService } from '../services/storage';

console.log("Starting Verification...");

// mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        clear: () => { store = {}; }
    };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// 1. Wellness
const score = calculateWellnessScore(8, 9, 8);
console.log(`Wellness (8,9,8): ${score} (Expected 83)`);
if (score !== 83) throw new Error(`Wellness failed: ${score}`);

// 2. Mission
let mission = { ...INITIAL_MISSION };
mission = updateMissionProgress(mission, 'cycle', 8);
console.log(`Mission Count after 1 cycle: ${mission.currentCount} (Expected 1)`);
if (mission.currentCount !== 1) throw new Error(`Mission 1 failed`);

mission = updateMissionProgress(mission, 'car', 5);
console.log(`Mission Count after 1 car: ${mission.currentCount} (Expected 1)`);
if (mission.currentCount !== 1) throw new Error(`Mission car failed`);

mission = updateMissionProgress(mission, 'cycle', 9);
mission = updateMissionProgress(mission, 'cycle', 9);
console.log(`Mission Count after 3 cycles: ${mission.currentCount} (Expected 3)`);
console.log(`Mission Completed: ${mission.completed} (Expected true)`);

if (!mission.completed) throw new Error(`Mission completion failed`);

// 3. Edge Case: 7 days car
let edgeMission = { ...INITIAL_MISSION };
for (let i = 0; i < 7; i++) {
    edgeMission = updateMissionProgress(edgeMission, 'car', 5);
}
console.log(`Edge Case Mission Count: ${edgeMission.currentCount} (Expected 0)`);
if (edgeMission.currentCount !== 0) throw new Error("Edge case failed");

console.log("ALL TESTS PASSED");
