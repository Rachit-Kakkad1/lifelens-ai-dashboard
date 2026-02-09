import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Zap, Leaf, CheckCircle2, SkipForward, TreePine, Brain, Flame } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { weeklyMission } from "@/data/mockData";

const MissionTracker = () => {
  const [showActivation, setShowActivation] = useState(true);
  const [completedRides, setCompletedRides] = useState(2);
  const totalRides = 3;

  // Calculate progress
  const progressPercent = (completedRides / totalRides) * 100;
  const energyGained = Math.round((completedRides / totalRides) * 18);
  const co2Saved = ((completedRides / totalRides) * 5.2).toFixed(1);

  // Hide activation message after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowActivation(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleComplete = () => {
    if (completedRides < totalRides) {
      setCompletedRides((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    // Skip logic - could decrement or just show feedback
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <PageTransition>
        <main className="pt-20 pb-10 px-6 max-w-5xl mx-auto">
          {/* Activation Success Animation */}
          <AnimatePresence>
            {showActivation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-10 text-center glow-primary"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="text-5xl mb-4"
                  >
                    🎯
                  </motion.div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Mission Activated
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    You're on track to gain{" "}
                    <span className="text-accent font-semibold">+18% energy</span> and save{" "}
                    <span className="text-eco font-semibold">5.2 kg CO₂</span> this week.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Weekly Mission Tracker
            </h1>
            <p className="text-muted-foreground text-sm">
              Track your progress and unlock your full impact
            </p>
          </motion.div>

          {/* Progress Tracker Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                {weeklyMission.title}
              </h2>
            </div>

            {/* Circular Progress Ring */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r="45"
                    stroke="hsl(260 30% 18%)"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="45"
                    stroke="hsl(261 100% 65%)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.8, ease: [0.22, 0.8, 0.28, 1] }}
                    style={{
                      strokeDasharray: circumference,
                      filter: "drop-shadow(0 0 8px hsl(261 100% 65% / 0.5))",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    key={completedRides}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-bold text-foreground"
                  >
                    {completedRides}/{totalRides}
                  </motion.span>
                  <span className="text-xs text-muted-foreground">rides</span>
                </div>
              </div>

              {/* Progress Stats */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="glass-card p-4 glow-cyan">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="text-xs text-muted-foreground">Energy gained</span>
                  </div>
                  <motion.p
                    key={energyGained}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-bold text-accent"
                  >
                    +{energyGained}%
                  </motion.p>
                </div>
                <div className="glass-card p-4 glow-green">
                  <div className="flex items-center gap-2 mb-1">
                    <Leaf className="w-4 h-4 text-eco" />
                    <span className="text-xs text-muted-foreground">CO₂ saved</span>
                  </div>
                  <motion.p
                    key={co2Saved}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-bold text-eco"
                  >
                    −{co2Saved} kg
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Daily Check-in Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 mb-6"
          >
            <p className="text-sm text-muted-foreground mb-4">Daily Check-in</p>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                disabled={completedRides >= totalRides}
                className="flex-1 btn-glow px-6 py-4 rounded-xl text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              >
                <CheckCircle2 className="w-5 h-5" />
                Mark ride complete
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSkip}
                className="flex-1 bg-secondary hover:bg-secondary/80 px-6 py-4 rounded-xl text-secondary-foreground font-semibold flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background"
              >
                <SkipForward className="w-5 h-5" />
                Skip today
              </motion.button>
            </div>
          </motion.div>

          {/* Motivation Insight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5 mb-6 flex items-start gap-3"
          >
            <Brain className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-foreground text-sm">
                You're <span className="text-primary font-semibold">{Math.round(progressPercent)}%</span> toward your weekly goal.
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {completedRides < totalRides
                  ? `${totalRides - completedRides} more ride${totalRides - completedRides > 1 ? "s" : ""} unlocks full impact.`
                  : "Amazing! You've unlocked your full impact this week!"}
              </p>
            </div>
          </motion.div>

          {/* End-of-Week Reward Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">
              If completed by Sunday
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-eco/10 flex items-center justify-center mb-2">
                  <TreePine className="w-6 h-6 text-eco" />
                </div>
                <p className="text-lg font-bold text-foreground">2.1</p>
                <p className="text-xs text-muted-foreground">Trees equiv.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-2">
                  <Brain className="w-6 h-6 text-accent" />
                </div>
                <p className="text-lg font-bold text-foreground">Week 3</p>
                <p className="text-xs text-muted-foreground">Wellness streak</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Flame className="w-6 h-6 text-primary" />
                </div>
                <p className="text-lg font-bold text-foreground">92%</p>
                <p className="text-xs text-muted-foreground">Consistency</p>
              </div>
            </div>
          </motion.div>
        </main>
      </PageTransition>
    </div>
  );
};

export default MissionTracker;