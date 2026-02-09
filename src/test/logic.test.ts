import { describe, it, expect, beforeEach } from 'vitest';
import { calculateWellnessScore } from '../logic/wellness';
import { calculateDailyCO2 } from '../logic/co2';
import { updateMissionProgress, INITIAL_MISSION } from '../logic/mission';
import { StorageService } from '../services/storage';

describe('LifeLens Logic Verification', () => {

    beforeEach(() => {
        StorageService.resetData();
    });

    it('calculates wellness score correctly', () => {
        // Formula: (8*0.4 + 9*0.3 + 8*0.3) * 10 = (3.2 + 2.7 + 2.4) * 10 = 8.3 * 10 = 83
        const score = calculateWellnessScore(8, 9, 8);
        expect(score).toBe(83);
    });

    it('calculates CO2 correctly', () => {
        expect(calculateDailyCO2('walk')).toBe(0);
        expect(calculateDailyCO2('cycle')).toBe(0);
        expect(calculateDailyCO2('public')).toBe(0.5);
        expect(calculateDailyCO2('car')).toBe(2.5);
    });

    it('updates mission progress correctly', () => {
        let mission = { ...INITIAL_MISSION };

        // Day 1: Cycle
        mission = updateMissionProgress(mission, 'cycle', 8);
        expect(mission.currentCount).toBe(1);
        expect(mission.completed).toBe(false);
        expect(mission.totalCo2Saved).toBe(2.5); // 2.5kg saved vs car
        expect(mission.totalEnergyGained).toBe(6);

        // Day 2: Car (no progress)
        mission = updateMissionProgress(mission, 'car', 5);
        expect(mission.currentCount).toBe(1);

        // Day 3: Cycle
        mission = updateMissionProgress(mission, 'cycle', 7);
        expect(mission.currentCount).toBe(2);

        // Day 4: Cycle (Completion)
        mission = updateMissionProgress(mission, 'cycle', 9);
        expect(mission.currentCount).toBe(3);
        expect(mission.completed).toBe(true);
    });

    it('handles the "7 days of CAR" edge case', () => {
        let mission = { ...INITIAL_MISSION };
        let totalCO2 = 0;

        for (let i = 0; i < 7; i++) {
            mission = updateMissionProgress(mission, 'car', 5);
            totalCO2 += calculateDailyCO2('car');
        }

        expect(mission.currentCount).toBe(0);
        expect(mission.completed).toBe(false);
        expect(totalCO2).toBe(2.5 * 7); // 17.5 kg
    });

    it('handles weekly reset logic', () => {
        let mission = { ...INITIAL_MISSION };

        // Complete mission
        mission = updateMissionProgress(mission, 'cycle', 8);
        mission = updateMissionProgress(mission, 'cycle', 8);
        mission = updateMissionProgress(mission, 'cycle', 8);
        expect(mission.completed).toBe(true);

        // Fast forward 8 days
        mission.weekStartTimestamp -= (8 * 24 * 60 * 60 * 1000);

        // New entry triggers reset
        mission = updateMissionProgress(mission, 'cycle', 8);

        expect(mission.currentCount).toBe(1); // Reset to 0 then added 1
        expect(mission.completed).toBe(false);
    });
});
