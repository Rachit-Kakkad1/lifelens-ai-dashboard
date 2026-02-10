import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer,
  CartesianGrid, Tooltip as RTooltip, ReferenceLine,
  AreaChart, Area
} from "recharts";
import {
  Zap, Leaf, Brain, ArrowUpRight,
  Bike, Car, Info, Trophy, TrendingUp,
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { StorageService } from "@/services/storage";
import { calculateSustainabilityScore } from "@/logic/co2";
import { generateCoachInsight, CoachInsight } from "@/logic/coach";
import { Slider } from "@/components/ui/slider";

const Dashboard = () => {
  const [wellnessScore, setWellnessScore] = useState(0);
  const [sustainabilityScore, setSustainabilityScore] = useState(0);
  const [weeklyCo2, setWeeklyCo2] = useState(0);
  const [entries, setEntries] = useState<any[]>([]);
  const [mission, setMission] = useState<any>(null);
  const [coachInsight, setCoachInsight] = useState<CoachInsight | null>(null);

  // Simulator State (Minimal)
  const [simTrips, setSimTrips] = useState(2);

  useEffect(() => {
    StorageService.init();
    const data = StorageService.getEntries();
    const missionState = StorageService.getMissionState();
    setMission(missionState);

    if (data.length > 0) {
      const insight = generateCoachInsight(data);
      setCoachInsight(insight);
      const latest = data[data.length - 1];
      setWellnessScore(latest.wellnessScore);

      // Sustainability Logic
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const weeklyEntries = data.filter(e => e.timestamp > oneWeekAgo);
      const sumCo2 = weeklyEntries.reduce((sum, e) => sum + e.co2Emitted, 0);
      setWeeklyCo2(sumCo2);
      setSustainabilityScore(calculateSustainabilityScore(sumCo2));

      // Chart Data
      const chartData = data.slice(-7).map(e => ({
        day: new Date(e.date).toLocaleDateString("en-US", { weekday: "short" }),
        wellness: e.wellnessScore,
        co2: e.co2Emitted * 20, // Scale for visibility on same axis (0-100 range)
        rawCo2: e.co2Emitted,
        energy: e.energy,
        mood: e.mood
      }));
      setEntries(chartData);
    }
  }, []);

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <PageTransition>
        <main className="pt-20 pb-10 px-6 max-w-7xl mx-auto space-y-8">

          {/* 1. HERO HEADER — Dual Intelligence */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Live Biometric & Climate Sync</h1>
              <p className="text-sm text-primary font-medium italic">"Small daily choices shape both your health and the planet."</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Internal Health */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-8 glow-cyan-strong border-l-4 border-accent"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-accent uppercase tracking-wider">Internal Health</span>
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-black text-foreground">{wellnessScore}</span>
                  <div className="mb-2">
                    <p className="text-sm font-bold text-foreground/80">Wellness Score</p>
                    <p className="text-xs text-muted-foreground">Energy, sleep, and mood</p>
                  </div>
                </div>
              </motion.div>

              {/* External Planet */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-8 glow-green-strong border-l-4 border-eco"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-eco uppercase tracking-wider">External Planet</span>
                  <Leaf className="w-5 h-5 text-eco" />
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-black text-foreground">{sustainabilityScore}</span>
                  <div className="mb-2">
                    <p className="text-sm font-bold text-foreground/80">Sustainability Score</p>
                    <p className="text-xs text-muted-foreground">Based on weekly CO₂</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* 2. DUAL-LAYER LIFE TIMELINE */}
          <section className="glass-card p-8 relative">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Integrated Impact Timeline
            </h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={entries}>
                  <defs>
                    <linearGradient id="colorWellness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--eco-green))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--eco-green))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <RTooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area
                    type="monotone" dataKey="wellness" name="Wellness"
                    stroke="hsl(var(--accent))" strokeWidth={3} fillOpacity={1} fill="url(#colorWellness)"
                  />
                  <Area
                    type="monotone" dataKey="co2" name="Planet Impact (Scaled)"
                    stroke="hsl(var(--eco-green))" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorCo2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-8 mt-4 text-xs font-medium uppercase tracking-widest">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-accent rounded-full" /> Internal Wellness</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-eco rounded-full border-dashed" /> External Impact (CO₂)</div>
            </div>
          </section>

          {/* 3. SPLIT INSIGHT CHAMBER & 4. MINI SIMULATOR */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* AI Coach Observation - Hero of the Chamber */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="font-bold text-foreground flex items-center gap-2 px-2">
                <Brain className="w-5 h-5 text-primary" /> Behavioral AI Observation
              </h3>
              <div className="glass-card p-8 bg-primary/5 border-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Brain className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <p className="text-2xl font-medium text-foreground leading-relaxed italic pr-12">
                    "{coachInsight?.text || "Analyzing your behavioral patterns..."}"
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="px-3 py-1 rounded-full bg-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20">
                      Verified Data Pattern
                    </div>
                    <div className="px-3 py-1 rounded-full bg-secondary text-[10px] font-bold uppercase tracking-widest text-foreground border border-border">
                      {coachInsight?.type === "balanced" ? "Human + Planet Impact" : coachInsight?.type === "health" ? "Health Focus" : "Climate Focus"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data-Driven Correlation Proofs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-5 border-l-4 border-accent">
                  <p className="text-xs font-bold text-accent uppercase mb-2">Health Causation</p>
                  <p className="text-sm">{coachInsight?.correlations.health}</p>
                </div>
                <div className="glass-card p-5 border-l-4 border-eco">
                  <p className="text-xs font-bold text-eco uppercase mb-2">Climate Causation</p>
                  <p className="text-sm">{coachInsight?.correlations.planet}</p>
                </div>
              </div>
            </div>

            {/* WOW ZONE - Mini Simulator */}
            <div className="space-y-6 lg:border-l lg:border-border lg:pl-8">
              <h3 className="font-bold text-primary flex items-center gap-2 px-2">
                <Brain className="w-4 h-4" /> Impact Simulator
              </h3>
              <div className="glass-card p-6 bg-primary/5 border-primary/20">
                <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-tighter">Replace car trips with cycling</p>
                <div className="flex items-center gap-4 mb-6">
                  <Slider
                    value={[simTrips]}
                    onValueChange={v => setSimTrips(v[0])}
                    max={7} step={1}
                    className="flex-1"
                  />
                  <span className="text-xl font-bold w-8">{simTrips}</span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-background/40 p-3 rounded-lg">
                    <span className="text-xs font-medium">Health</span>
                    <span className="text-sm font-bold text-accent">+{simTrips * 4}% energy</span>
                  </div>
                  <div className="flex justify-between items-center bg-background/40 p-3 rounded-lg">
                    <span className="text-xs font-medium">Planet</span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-eco">−{(simTrips * 2.5).toFixed(1)} kg CO₂</p>
                      <p className="text-[10px] text-muted-foreground italic">≈ {((simTrips * 2.5) / 1.5).toFixed(1)} trees saved 🌱</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. UNIFIED AI MISSION CARD */}
          <section className="pt-4">
            <div className="glass-card p-1 border-primary/30">
              <div className="flex flex-col md:flex-row items-center gap-6 p-6">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shrink-0">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Your Highest-Impact Action</h4>
                  <h2 className="text-2xl font-black mb-1">Cycle 3× This Week</h2>
                  <p className="text-sm text-muted-foreground italic">One habit. Two impacts.</p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="text-center px-4">
                    <p className="text-lg font-bold text-accent">+18%</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Energy</p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="text-center px-4">
                    <p className="text-lg font-bold text-eco">−5.2 kg</p>
                    <p className="text-[10px] text-muted-foreground uppercase">CO₂</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-glow px-8 py-3 rounded-xl font-bold ml-4"
                  >
                    Commit to Impact
                  </motion.button>
                </div>
              </div>
            </div>
          </section>

        </main>
      </PageTransition>
    </div>
  );
};

export default Dashboard;
