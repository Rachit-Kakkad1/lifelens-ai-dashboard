/**
 * Calculates wellness score based on sleep, energy, and mood.
 * Formula: (sleep * 0.4 + energy * 0.3 + mood * 0.3) * 10
 * Result is normalized to 0-100.
 * 
 * @param sleep - Hours of sleep / quality (0-10)
 * @param energy - Energy level (0-10)
 * @param mood - Mood level (0-10)
 * @returns wellness score (0-100)
 */
export const calculateWellnessScore = (
    sleep: number,
    energy: number,
    mood: number
): number => {
    const rawScore = (sleep * 0.4) + (energy * 0.3) + (mood * 0.3);
    const normalizedScore = Math.round(rawScore * 10);

    // Clamp between 0 and 100 just in case
    return Math.min(100, Math.max(0, normalizedScore));
};
