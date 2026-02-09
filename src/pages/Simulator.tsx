import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer,
  CartesianGrid, Tooltip,
} from "recharts";
import { SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { simulatorBaseline, simulatorScenario } from "@/data/mockData";

const Simulator = () => {
  const [trips, setTrips] = useState(3);

  const scenarioData = simulatorBaseline.map((b, i) => {
    const s = simulatorScenario[i];
    const factor = trips / 3;
    return {
      week: b.week,
      baselineEnergy: b.energy,
      baselineCO2: b.co2,
      scenarioEnergy: Math.round(b.energy + (s.energy - b.energy) * factor),
      scenarioCO2: +(b.co2 + (s.co2 - b.co2) * factor).toFixed(1),
    };
  });

  const lastBase = simulatorBaseline[simulatorBaseline.length - 1];
  const lastScen = scenarioData[scenarioData.length - 1];
  const energyDelta = lastScen.scenarioEnergy - lastBase.energy;
  const co2Delta = (lastScen.scenarioCO2 - lastBase.co2).toFixed(1);

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <PageTransition>
        <main className="pt-20 pb-10 px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              What-If Impact Simulator
            </h1>
          </motion.div>

          {/* Slider Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              <p className="text-foreground font-medium">
                Replace <span className="text-accent font-bold">{trips} car trips</span> with walking per week
              </p>
            </div>
            <input
              type="range"
              min={0}
              max={7}
              value={trips}
              onChange={(e) => setTrips(Number(e.target.value))}
              className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
              aria-label="Number of car trips to replace with walking"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0 trips</span>
              <span>7 trips</span>
            </div>
          </motion.div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Projected Outcomes vs. Baseline
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scenarioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(260 30% 18%)" />
                <XAxis dataKey="week" stroke="hsl(224 20% 78%)" fontSize={13} tickLine={false} />
                <YAxis stroke="hsl(224 20% 78%)" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(260 50% 10%)",
                    border: "1px solid hsl(260 40% 22%)",
                    borderRadius: "12px",
                    color: "hsl(230 50% 97%)",
                    fontSize: "13px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="baselineEnergy"
                  stroke="hsl(224 20% 50%)"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                  name="Baseline Energy"
                />
                <Line
                  type="monotone"
                  dataKey="scenarioEnergy"
                  stroke="hsl(174, 100%, 45%)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "hsl(174, 100%, 45%)", strokeWidth: 0 }}
                  name="Scenario Energy"
                  animationDuration={900}
                  animationEasing="ease-in-out"
                />
                <Line
                  type="monotone"
                  dataKey="scenarioCO2"
                  stroke="hsl(137, 55%, 60%)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(137, 55%, 60%)", strokeWidth: 0 }}
                  name="Scenario CO₂"
                  animationDuration={900}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Delta Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-6"
          >
            <div className="glass-card p-8 text-center glow-cyan-strong">
              <motion.p
                key={energyDelta}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                className="text-5xl md:text-6xl font-extrabold text-accent drop-shadow-[0_0_25px_hsl(174,100%,45%,0.6)]"
              >
                +{energyDelta}%
              </motion.p>
              <p className="text-base text-muted-foreground mt-2 font-medium">Energy</p>
            </div>
            <div className="glass-card p-8 text-center glow-green-strong">
              <motion.p
                key={co2Delta}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                className="text-5xl md:text-6xl font-extrabold text-eco drop-shadow-[0_0_25px_hsl(137,55%,60%,0.6)]"
              >
                {co2Delta} kg
              </motion.p>
              <p className="text-base text-muted-foreground mt-2 font-medium">CO₂</p>
            </div>
          </motion.div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Simulator;
