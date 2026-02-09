import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { StorageService } from "@/services/storage";
import { MissionState } from "@/types";
import { INITIAL_MISSION } from "@/logic/mission";
import { Target, Trophy, Bike, CheckCircle2, ArrowUpRight, Leaf } from "lucide-react";

const MissionTracker = () => {
  const [mission, setMission] = useState<MissionState>(INITIAL_MISSION);

  useEffect(() => {
    StorageService.init();
    const loaded = StorageService.getMissionState();
    setMission(loaded);
  }, []);

  const progress = Math.min(100, (mission.currentCount / mission.targetCount) * 100);

  return (
    <div className="min-h-screen gradient-bg relative overflow-x-hidden">
      <Navbar />


      <PageTransition>
        <main className="pt-20 pb-10 px-6 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex justify-between items-end"
          >
            <div>
              <p className="text-sm text-muted-foreground mb-1">Weekly Challenge</p>
              <h1 className="text-3xl font-bold text-foreground">Mission Control</h1>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-accent">{mission.completed ? "COMPLETED" : "IN PROGRESS"}</p>
              <p className="text-xs text-muted-foreground">Resets in 2 days</p>
            </div>
          </motion.div>

          {/* Active Mission Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass-card p-8 border-l-4 ${mission.completed ? "border-l-accent" : "border-l-primary"} relative overflow-hidden`}
          >
            {mission.completed && (
              <div className="absolute top-0 right-0 p-4">
                <Trophy className="w-16 h-16 text-accent/20" />
              </div>
            )}

            <div className="flex items-start gap-4 mb-6">
              <div className={`p-3 rounded-xl ${mission.completed ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"}`}>
                <Bike className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{mission.title}</h2>
                <p className="text-muted-foreground">Replace your car commute with cycling.</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2 flex justify-between text-sm font-medium">
              <span>Progress</span>
              <span>{mission.currentCount} / {mission.targetCount} rides</span>
            </div>
            <div className="h-4 bg-secondary rounded-full overflow-hidden mb-8">
              <motion.div
                className={`h-full ${mission.completed ? "bg-accent" : "bg-primary"}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-background/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Energy Gained</p>
                <p className="text-xl font-bold flex items-center gap-1">
                  +{mission.totalEnergyGained}% <ArrowUpRight className="w-4 h-4 text-green-400" />
                </p>
              </div>
              <div className="p-4 bg-background/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">CO₂ Avoided</p>
                <p className="text-xl font-bold flex items-center gap-1">
                  {mission.totalCo2Saved.toFixed(1)}kg <Leaf className="w-4 h-4 text-eco" />
                </p>
              </div>
            </div>
          </motion.div>

          {/* Completion Banner */}
          <AnimatePresence>
            {mission.completed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-8 p-6 bg-accent/10 border border-accent/20 rounded-xl flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Mission Accomplished!</h3>
                  <p className="text-sm text-foreground/80">
                    You've hit your weekly target. Validated by LifeLens logic.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </PageTransition>
    </div>
  );
};

export default MissionTracker;