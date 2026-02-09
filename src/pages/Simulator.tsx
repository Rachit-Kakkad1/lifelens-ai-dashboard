import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { StorageService } from "@/services/storage";
import { calculateWellnessScore } from "@/logic/wellness"; // Re-use logic
import { Zap, Leaf, RotateCcw, ArrowRight, Brain } from "lucide-react";

// Types
type SimulationState = {
  sleep: number;
  energy: number;
  mood: number;
  transport: "walk" | "cycle" | "public" | "car";
};

const Simulator = () => {
  // Baseline values from real data
  const [baseline, setBaseline] = useState({
    wellness: 65, // Default average
    co2: 12.5     // Default weekly sum
  });

  // Current stimulation state
  const [simState, setSimState] = useState<SimulationState>({
    sleep: 7,
    energy: 6,
    mood: 6,
    transport: "car"
  });

  const [simulatedWellness, setSimulatedWellness] = useState(0);
  const [simulatedCo2, setSimulatedCo2] = useState(0);

  // Load baseline on mount
  useEffect(() => {
    StorageService.init();
    const data = StorageService.getEntries();

    if (data.length > 0) {
      // 1. Calculate Baseline Wellness (Rolling avg of last 7)
      const last7 = data.slice(-7);
      const avgWellness = last7.reduce((sum, e) => sum + e.wellnessScore, 0) / last7.length;

      // 2. Calculate Baseline CO2 (Sum of last 7 days)
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const weeklyEntries = data.filter(e => e.timestamp > oneWeekAgo);
      const sumCo2 = weeklyEntries.reduce((sum, e) => sum + e.co2Emitted, 0);

      setBaseline({
        wellness: Math.round(avgWellness),
        co2: parseFloat(sumCo2.toFixed(1))
      });

      // Initialize sim state to averages/modes if possible, or just defaults
      // Let's keep defaults but maybe update sleep/energy to avg?
      setSimState(prev => ({
        ...prev,
        sleep: Math.round(last7.reduce((s, e) => s + e.sleep, 0) / last7.length) || 7,
        energy: Math.round(last7.reduce((s, e) => s + e.energy, 0) / last7.length) || 6,
        mood: Math.round(last7.reduce((s, e) => s + e.mood, 0) / last7.length) || 6,
        // Keep transport as CAR to show impact of switching?
        transport: "car"
      }));
    }
  }, []);

  // Recalculate simulation whenever state changes
  useEffect(() => {
    // Wellness
    const newWellness = calculateWellnessScore(simState.sleep, simState.energy, simState.mood);
    setSimulatedWellness(newWellness);

    // CO2
    // We want to see the IMPACT on the WEEKLY total if we change ONE day or habitual?
    // "Simulator" usually implies "If I do this today, what happens?" 
    // OR "If I do this for a week?"
    // Let's assume: "Projected Daily Impact" vs "Baseline Avg Daily"?
    // OR: "If I change my habit to X, my weekly CO2 becomes Y"

    // Let's calculate: 
    // Baseline CO2 is existing weekly sum.
    // Projected CO2: (Baseline - AvgDailyCO2) + NewDailyCO2? 
    // Simpler: Just show the simulated daily values and compare to "Average Daily" baseline.

    // Actually, requirement says: "baseline from stored data", "dynamic deltas".
    // Let's compare Simulated Daily Wellness vs Baseline Avg Wellness.
    // Let's compare Simulated Daily CO2 vs Baseline Avg Daily CO2 (derived from weekly).

    // Let's calculate Daily CO2 for sim
    const factors = { walk: 0, cycle: 0, public: 0.5, car: 2.5 };
    const newDailyCo2 = factors[simState.transport];

    setSimulatedCo2(newDailyCo2);

  }, [simState]);

  // Derived deltas
  // Compare Sim Wellness to Baseline Wellness
  const wellnessDelta = simulatedWellness - baseline.wellness;

  // Compare Sim CO2 to Baseline Avg Daily CO2?
  // Baseline is Weekly Sum. Avg Daily = Weekly / 7 (or entries count).
  // Let's assume 7 days for projections.
  const baselineDailyCo2 = baseline.co2 / 7;
  const co2Delta = simulatedCo2 - baselineDailyCo2;

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <PageTransition>
        <main className="pt-20 pb-10 px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground">Loop Simulator</h1>
            <p className="text-muted-foreground mt-2">
              See how changing your daily habits impacts your future wellness.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="space-y-6">
              <div className="glass-card p-6 space-y-6">
                <div>
                  <label className="text-sm font-medium mb-4 block">Sleep Duration ({simState.sleep}h)</label>
                  <Slider
                    min={0} max={10} step={1}
                    value={[simState.sleep]}
                    onValueChange={v => setSimState({ ...simState, sleep: v[0] })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-4 block">Energy Level ({simState.energy})</label>
                  <Slider
                    min={0} max={10} step={1}
                    value={[simState.energy]}
                    onValueChange={v => setSimState({ ...simState, energy: v[0] })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-4 block">Mood ({simState.mood})</label>
                  <Slider
                    min={0} max={10} step={1}
                    value={[simState.mood]}
                    onValueChange={v => setSimState({ ...simState, mood: v[0] })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-4 block">Transport</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["walk", "cycle", "public", "car"] as const).map(m => (
                      <Button
                        key={m}
                        variant={simState.transport === m ? "default" : "outline"}
                        onClick={() => setSimState({ ...simState, transport: m })}
                        className="capitalize"
                      >
                        {m}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {/* Wellness Card */}
              <motion.div layout className="glass-card p-8 relative overflow-hidden glow-cyan border-l-4 border-accent">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-accent uppercase tracking-widest mb-1 block">Internal Wellness</span>
                    <h3 className="font-bold text-foreground">Projected Health</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">vs. your 7-day average ({baseline.wellness})</p>
                  </div>
                  <Zap className={`w-5 h-5 ${wellnessDelta >= 0 ? "text-accent" : "text-muted-foreground"}`} />
                </div>

                <div className="flex items-end gap-3">
                  <span className="text-6xl font-black text-foreground">{simulatedWellness}</span>
                  <span className={`text-sm mb-2 font-bold ${wellnessDelta >= 0 ? "text-accent" : "text-red-400"}`}>
                    {wellnessDelta > 0 ? "+" : ""}{wellnessDelta} pts
                  </span>
                </div>
              </motion.div>

              {/* CO2 Card */}
              <motion.div layout className="glass-card p-8 relative overflow-hidden glow-green border-l-4 border-eco">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-eco uppercase tracking-widest mb-1 block">External Impact</span>
                    <h3 className="font-bold text-foreground">Daily CO₂ Impact</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">vs. your avg daily ({baselineDailyCo2.toFixed(1)} kg)</p>
                  </div>
                  <Leaf className={`w-5 h-5 ${co2Delta <= 0 ? "text-eco" : "text-orange-400"}`} />
                </div>

                <div className="flex items-end gap-3">
                  <span className="text-6xl font-black text-foreground">{simulatedCo2}</span>
                  <span className="text-xl font-medium text-muted-foreground mb-1">kg</span>
                  <div className="mb-1">
                    <p className={`text-sm font-bold ${co2Delta <= 0 ? "text-eco" : "text-red-400"}`}>
                      {co2Delta > 0 ? "+" : ""}{co2Delta.toFixed(1)} relative
                    </p>
                    <p className="text-[10px] text-muted-foreground italic">≈ {((2.5 - simulatedCo2) / 1.5).toFixed(1)} trees saved 🌱</p>
                  </div>
                </div>
              </motion.div>

              <div className="glass-card p-6 bg-primary/5 border-primary/20">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" /> AI Projection
                </h4>
                <p className="text-sm text-foreground/80">
                  {wellnessDelta > 10
                    ? "This adjustments would significantly boost your wellness!"
                    : co2Delta < -1
                      ? "Great choice! This transport switch massively reduces your footprint."
                      : "Small adjustments to sleep and mood can have compounding effects."}
                </p>
              </div>
            </div>
          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Simulator;
