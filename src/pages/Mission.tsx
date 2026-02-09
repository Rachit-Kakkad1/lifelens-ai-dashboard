import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Target, Zap, Leaf } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { weeklyMission } from "@/data/mockData";

const Mission = () => {
  const navigate = useNavigate();
  
  return (
  <div className="min-h-screen gradient-bg">
    <Navbar />
    <PageTransition>
      <main className="pt-20 pb-10 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your Highest-Impact
            <br />
            Action This Week
          </h1>
        </motion.div>

        {/* Mission Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ease: [0.22, 0.8, 0.28, 1] }}
          className="glass-card p-8 glow-primary mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              {weeklyMission.title}
            </h2>
          </div>
          <p className="text-muted-foreground text-sm mb-8">
            {weeklyMission.description}
          </p>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyMission.missionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(260 30% 18%)" />
              <XAxis dataKey="day" stroke="hsl(224 20% 78%)" fontSize={13} tickLine={false} />
              <YAxis stroke="hsl(224 20% 78%)" fontSize={12} tickLine={false} />
              <Line
                type="monotone"
                dataKey="baseline"
                stroke="hsl(224 20% 50%)"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                name="Current"
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="hsl(174, 100%, 45%)"
                strokeWidth={3}
                dot={{ r: 4, fill: "hsl(174, 100%, 45%)", strokeWidth: 0 }}
                name="With Mission"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Benefit badges */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-3 bg-accent/10 rounded-xl p-4">
              <Zap className="w-5 h-5 text-accent" />
              <div>
                <p className="text-lg font-bold text-accent">
                  {weeklyMission.energyBoost}
                </p>
                <p className="text-xs text-muted-foreground">weekly energy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-eco/10 rounded-xl p-4">
              <Leaf className="w-5 h-5 text-eco" />
              <div>
                <p className="text-lg font-bold text-eco">
                  {weeklyMission.co2Reduction}
                </p>
                <p className="text-xs text-muted-foreground">CO₂ saved</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/mission/tracker")}
              className="btn-glow px-10 py-4 rounded-xl text-primary-foreground font-semibold text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              Start Weekly Mission →
            </motion.button>
          </motion.div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Mission;
