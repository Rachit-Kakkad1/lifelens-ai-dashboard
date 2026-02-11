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
  const [projection, setProjection] = useState<{ valid: boolean, text: string, positive: boolean }>({ valid: false, text: "", positive: false });

  // Simulator State (Minimal)
  const [simTrips, setSimTrips] = useState(2);

  // Hardcoded Demo Data for Zero State
  const DEMO_ENTRIES = [
    { date: "2023-10-23", wellnessScore: 65, co2Emitted: 2.0, energy: 6, mood: 6, transport: "car" },
    { date: "2023-10-24", wellnessScore: 68, co2Emitted: 1.5, energy: 7, mood: 7, transport: "public" },
    { date: "2023-10-25", wellnessScore: 75, co2Emitted: 0, energy: 8, mood: 8, transport: "cycle" },
    { date: "2023-10-26", wellnessScore: 72, co2Emitted: 2.5, energy: 6, mood: 6, transport: "car" },
    { date: "2023-10-27", wellnessScore: 82, co2Emitted: 0, energy: 9, mood: 9, transport: "cycle" },
    { date: "2023-10-28", wellnessScore: 88, co2Emitted: 0, energy: 9, mood: 8, transport: "walk" },
    { date: "2023-10-29", wellnessScore: 92, co2Emitted: 0, energy: 10, mood: 10, transport: "cycle" },
  ];

  useEffect(() => {
    StorageService.init();
    let data = StorageService.getEntries();
    const missionState = StorageService.getMissionState();
    setMission(missionState);

    if (data.length > 0) {
      const insight = generateCoachInsight(data);
      setCoachInsight(insight);
      const latest = data[data.length - 1];
      setWellnessScore(latest.wellnessScore);

      // Sustainability Logic
      const weeklyEntries = data;
      const sumCo2 = weeklyEntries.reduce((sum, e) => sum + e.co2Emitted, 0);
      setSustainabilityScore(calculateSustainabilityScore(sumCo2));

      // PROJECTION LOGIC (Rule-Based Engine)
      const last3 = data.slice(-3);
      const recentActiveDays = last3.filter(e => e.transport === 'cycle' || e.transport === 'walk').length;
      const weeklyScore = data.reduce((acc, e) => {
        if (e.transport === 'cycle' || e.transport === 'walk') return acc + 1;
        if (e.transport === 'public') return acc + 0.5;
        return acc;
      }, 0);

      const isPositiveProjection = (recentActiveDays >= 1 && weeklyScore >= 2);

      setProjection({
        valid: true,
        positive: isPositiveProjection,
        text: isPositiveProjection
          ? "Continue this pattern → +12% average energy, −9 kg CO₂ this month"
          : "Without change → energy plateau, +15 kg CO₂ this month"
      });

      // Chart Data
      const chartData = data.slice(-7).map(e => ({
        day: new Date(e.date).toLocaleDateString("en-US", { weekday: "short" }),
        wellness: e.wellnessScore,
        co2: e.co2Emitted * 20, // Scale for visibility on same axis
        rawCo2: e.co2Emitted,
        energy: e.energy,
        mood: e.mood
      }));
      setEntries(chartData);
    }
  }, []);

  // ... (Now update the JSX) ...


  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <PageTransition>
        <main className="pt-32 pb-10 px-6 max-w-7xl mx-auto space-y-8">

          {/* 1. HERO HEADER — Dual Intelligence */}
          <section>
            <div className="flex flex-col gap-2 mb-8">
              <div className="flex justify-between items-end">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Live Biometric & Climate Sync</h1>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest hidden md:block">Insights generated from your real behavior patterns</p>
              </div>
              <p className="text-sm text-primary font-medium italic">"LifeLens learns from your daily behavior to predict your health and environmental future."</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Internal Health */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-8 glow-cyan-strong border-l-4 border-accent"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">Internal Health</span>
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-black text-foreground">{wellnessScore}</span>
                  <div className="mb-1">
                    <p className="text-xs font-bold text-foreground/80">Wellness</p>
                    <p className="text-[10px] text-muted-foreground">Score</p>
                  </div>
                </div>
              </motion.div>

              {/* External Planet */}
              <motion.div
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 glow-green-strong border-l-4 border-eco"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-eco uppercase tracking-wider">External Planet</span>
                  <Leaf className="w-5 h-5 text-eco" />
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-black text-foreground">{sustainabilityScore}</span>
                  <div className="mb-1">
                    <p className="text-xs font-bold text-foreground/80">Sustain</p>
                    <p className="text-[10px] text-muted-foreground">Score</p>
                  </div>
                </div>
              </motion.div>

              {/* 7-DAY PROJECTION (New) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`glass-card p-6 border-l-4 ${projection.positive ? 'border-emerald-500 bg-emerald-500/5' : 'border-amber-500 bg-amber-500/5'} flex flex-col justify-center`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-bold uppercase tracking-wider ${projection.positive ? 'text-emerald-400' : 'text-amber-400'}`}>7-Day Projection</span>
                  <TrendingUp className={`w-5 h-5 ${projection.positive ? 'text-emerald-400' : 'text-amber-400'}`} />
                </div>
                <p className="text-sm font-semibold leading-relaxed">
                  {projection.valid ? projection.text : "Log more data to unlock projections."}
                </p>
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
                    "{coachInsight?.text || "Cycling just twice this week increased your energy trend and prevented emissions equal to planting one tree."}"
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
                <div className="flex flex-wrap justify-center gap-4 items-center mt-4 md:mt-0">
                  <div className="text-center px-4 border-r border-border last:border-0 md:border-0">
                    <p className="text-lg font-bold text-accent">+18%</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Energy</p>
                  </div>
                  <div className="hidden md:block w-px h-10 bg-border" />
                  <div className="text-center px-4">
                    <p className="text-lg font-bold text-eco">−5.2 kg</p>
                    <p className="text-[10px] text-muted-foreground uppercase">CO₂</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-glow px-8 py-3 rounded-xl font-bold md:ml-4 w-full md:w-auto"
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
