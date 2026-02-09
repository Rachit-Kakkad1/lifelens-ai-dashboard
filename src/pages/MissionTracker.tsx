import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { StorageService } from "@/services/storage";
import { MissionState } from "@/types";
import { INITIAL_MISSION } from "@/logic/mission";
import { Target, Trophy, Bike, CheckCircle2, ArrowUpRight, Leaf, Zap } from "lucide-react";

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
            className={`glass-card p-10 border-l-8 ${mission.completed ? "border-accent glow-cyan-strong" : "border-primary glow-primary"} relative overflow-hidden`}
          >
            {mission.completed && (
              <div className="absolute top-0 right-0 p-6">
                <Trophy className="w-24 h-24 text-accent/10" />
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
              <div className={`p-5 rounded-2xl ${mission.completed ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"}`}>
                <Bike className="w-12 h-12" />
              </div>
              <div className="text-center md:text-left flex-1">
                <span className={`text-xs font-bold uppercase tracking-[0.2em] mb-2 block ${mission.completed ? "text-accent" : "text-primary"}`}>Active Behavioral Loop</span>
                <h2 className="text-4xl font-black text-foreground mb-4">{mission.title}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="px-4 py-2 rounded-xl bg-background/50 border border-border flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-foreground">Human Health +18%</span>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-background/50 border border-border flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-eco" />
                    <span className="text-xs font-bold text-foreground">Planet Health -5.2kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3 flex justify-between text-sm font-bold uppercase tracking-tighter">
              <span className="text-muted-foreground">Mission Saturation</span>
              <span className={mission.completed ? "text-accent" : "text-primary"}>{progress}% COMPLETE</span>
            </div>
            <div className="h-6 bg-secondary/50 rounded-2xl overflow-hidden mb-12 border border-border/50 p-1">
              <motion.div
                className={`h-full rounded-xl ${mission.completed ? "bg-accent glow-cyan" : "bg-primary glow-primary"}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="p-6 bg-background/20 rounded-2xl border border-border/50 group hover:border-accent/40 transition-colors">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-3 tracking-widest">Energy Gained</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-foreground">+{mission.totalEnergyGained}%</p>
                  <ArrowUpRight className="w-6 h-6 text-accent mb-1" />
                </div>
              </div>
              <div className="p-6 bg-background/20 rounded-2xl border border-border/50 group hover:border-eco/40 transition-colors">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-3 tracking-widest">CO₂ Avoided</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-foreground">{mission.totalCo2Saved.toFixed(1)}kg</p>
                  <Leaf className="w-6 h-6 text-eco mb-1" />
                </div>
              </div>
              <div className="p-6 bg-background/20 rounded-2xl border border-border/50 group hover:border-primary/40 transition-colors sm:col-span-2 md:col-span-1">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-3 tracking-widest">Emotional Impact</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-foreground">{(mission.totalCo2Saved / 1.5).toFixed(1)}</p>
                  <span className="text-xl font-bold text-foreground/60 mb-1">Trees saved</span>
                  <span className="text-2xl mb-1 ml-1">🌱</span>
                </div>
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