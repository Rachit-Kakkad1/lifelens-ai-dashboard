import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip as RTooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Zap, Leaf, Brain } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { StorageService } from "@/services/storage";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-4 text-sm"
    >
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          {p.dataKey}: {p.value}
        </p>
      ))}
      <p className="text-muted-foreground text-xs mt-2">Confidence: 87%</p>
    </motion.div>
  );
};

const Dashboard = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [carbonFootprint, setCarbonFootprint] = useState(0);
  const [insight, setInsight] = useState("Start by checking in to see your impact.");
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    const loadData = () => {
      // Initialize storage/version check
      StorageService.init();

      const data = StorageService.getEntries();

      if (data.length === 0) {
        setMockMode(true);
        // Use mock data for empty state if desired, or just show zeros
        // For now, let's just leave zeros but show a prompt
        return;
      }

      // 1. Weekly CO2 (Sum of last 7 days)
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const weeklyEntries = data.filter(e => e.timestamp > oneWeekAgo);
      const weeklyCo2 = weeklyEntries.reduce((sum, e) => sum + e.co2Emitted, 0);
      setCarbonFootprint(parseFloat(weeklyCo2.toFixed(1)));

      // 2. Daily Wellness (Latest entry)
      const latestEntry = data[data.length - 1];
      if (latestEntry) {
        setWellnessScore(latestEntry.wellnessScore);

        // Dynamic insight
        if (latestEntry.wellnessScore > 80) {
          setInsight("Excellent balance! Your high energy and mood are boosting your wellness.");
        } else if (latestEntry.sleep < 6) {
          setInsight("Prioritize sleep tonight to boost your wellness score tomorrow.");
        } else if (latestEntry.transport === "car") {
          setInsight("Switching to active transport could lower your CO₂ footprint.");
        } else {
          setInsight("Consistent small habits lead to long-term well-being.");
        }
      }

      // 3. Timeline Data
      // Map last 7 entries to chart format
      // Need to fill in missing days? Or just show what we have. 
      // Recharts handles gaps if we just map the entries. 
      // Let's format date to "Mon", "Tue" etc.
      const chartData = data.slice(-7).map(e => ({
        day: new Date(e.date).toLocaleDateString("en-US", { weekday: "short" }),
        // Energy/Mood 0-10. CO2 0-2.5+. 
        // Let's keep raw values.
        energy: e.energy,
        mood: e.mood,
        co2: e.co2Emitted
      }));

      setEntries(chartData);
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <PageTransition>
        <main className="pt-20 pb-10 px-6 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <p className="text-sm text-muted-foreground mb-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="text-3xl font-bold text-foreground">
              Your Life Impact Today
            </h1>
            <p className="text-base text-muted-foreground mt-2">
              One small habit can improve your health and reduce your carbon footprint.
            </p>
          </motion.div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-sm text-muted-foreground">Wellness Absorbed</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Daily Wellness Score</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-bold text-foreground">{wellnessScore}</span>
                <div className="flex items-center gap-1 text-accent text-sm mb-2">
                  <Zap className="w-4 h-4" />
                  <span>{wellnessScore > 0 ? "Active" : "No Data"}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-eco" />
                <span className="text-sm text-muted-foreground">Carbon Footprint</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">kg CO₂/week</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-bold text-foreground">{carbonFootprint}</span>
                <span className="text-sm text-eco mb-2 flex items-center gap-1">
                  <Leaf className="w-4 h-4" />
                  <span>{carbonFootprint < 5 ? "Low Impact" : "High Impact"}</span>
                </span>
              </div>
            </motion.div>
          </div>

          {/* Insight sentence */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 mb-6 text-sm text-muted-foreground"
          >
            <Brain className="w-4 h-4 text-primary" />
            <span>{insight}</span>
          </motion.div>

          {/* Timeline Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Weekly Impact Timeline
            </h2>
            <div className="h-[300px] w-full">
              {entries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={entries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(260 30% 18%)" />
                    <XAxis
                      dataKey="day"
                      stroke="hsl(224 20% 78%)"
                      fontSize={13}
                      tickLine={false}
                    />
                    <YAxis stroke="hsl(224 20% 78%)" fontSize={12} tickLine={false} />
                    <RTooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      stroke="hsl(174, 100%, 45%)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "hsl(174, 100%, 45%)", strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: "hsl(174, 100%, 45%)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="hsl(261, 100%, 65%)"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "hsl(261, 100%, 65%)", strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="co2"
                      stroke="hsl(137, 55%, 60%)"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data yet. Complete a check-in to see your timeline.
                </div>
              )}
            </div>
            <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-accent inline-block rounded" /> Energy
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-primary inline-block rounded" /> Mood
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-eco inline-block rounded border-dashed" /> CO₂
              </span>
            </div>
          </motion.div>

          {/* Bottom stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: "Moderate", icon: "🏃", sub: "Activity" },
              { label: "On Track", icon: "😴", sub: "Sleep" },
              { label: "4.2 trees", icon: "🌳", sub: "Offset equiv." },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="glass-card p-4 text-center"
              >
                <span className="text-2xl">{s.icon}</span>
                <p className="text-sm font-medium text-foreground mt-1">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Dashboard;
