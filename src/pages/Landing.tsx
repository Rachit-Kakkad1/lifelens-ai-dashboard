import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Leaf, Zap, Activity, Brain, CheckCircle2, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

// Realistic Data: "The Active Commute Week"
const landingData = [
    { day: "Mon", wellness: 65, co2Saved: 2.0 },
    { day: "Tue", wellness: 68, co2Saved: 3.5 },
    { day: "Wed", wellness: 75, co2Saved: 6.0 }, // Peak active day
    { day: "Thu", wellness: 72, co2Saved: 7.8 },
    { day: "Fri", wellness: 82, co2Saved: 9.5 },
    { day: "Sat", wellness: 88, co2Saved: 11.2 },
    { day: "Sun", wellness: 92, co2Saved: 12.5 },
];

const Landing = () => {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();

    // Parallax effects
    const yHero = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    return (
        <div className="min-h-screen gradient-bg font-sans selection:bg-accent/30 text-foreground overflow-x-hidden">
            <Navbar />

            {/* 1. HERO SECTION */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-28 md:pt-24 px-6 text-center">
                {/* Background Ambient Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse-glow" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] -z-10" />

                <motion.div
                    style={{ y: yHero, opacity: opacityHero }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-secondary/80 border border-border/50 text-xs font-semibold tracking-widest uppercase mb-6 text-muted-foreground backdrop-blur-sm">
                            The Intelligent Ecosystem
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 drop-shadow-sm">
                            See How Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Daily Habits</span> Shape Your Health and the Planet.
                        </h1>
                    </motion.div>


                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        LifeLens turns sleep, mood, and movement into clear insights, proving that self-care is the ultimate climate action.
                    </motion.p>


                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4"
                    >
                        <Button
                            onClick={() => navigate("/onboarding")}
                            size="lg"
                            className="relative rounded-full px-10 py-8 text-xl font-bold transition-all duration-300
                            bg-primary text-primary-foreground hover:scale-105 hover:shadow-[0_0_40px_-5px_hsl(var(--primary))]
                            shadow-[0_0_20px_-5px_hsl(var(--primary))]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Start your 7-day impact journey <ChevronRight className="w-6 h-6" />
                            </span>
                            {/* Inner Glow Pulse */}
                            <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse-slow" />
                        </Button>
                    </motion.div>

                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50"
                >
                    <span className="text-xs uppercase tracking-widest">Explore</span>
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-muted-foreground/50 to-transparent" />
                </motion.div>
            </section>

            {/* 2. DUAL-IMPACT VISUAL */}
            <section className="py-24 px-6 relative">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-sm font-bold text-accent uppercase tracking-widest mb-3">Sync Your World</h2>
                        <p className="text-3xl font-semibold">One habit can improve both.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                        {/* Card 1: Wellness */}
                        <motion.div
                            initial={{ opacity: 0, x: -50, rotateY: 10 }}
                            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="glass-card p-0 rounded-[2.5rem] border-primary/20 bg-gradient-to-br from-background/90 to-background/50 shadow-2xl relative group overflow-hidden h-full flex flex-col justify-between"
                            style={{ perspective: 1000 }}
                        >
                            {/* Chart Background */}
                            <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={landingData}>
                                        <defs>
                                            <linearGradient id="colorWellnessLanding" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="wellness"
                                            stroke="hsl(var(--accent))"
                                            strokeWidth={4}
                                            fill="url(#colorWellnessLanding)"
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="absolute top-0 right-0 p-32 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors duration-700" />

                            <div className="relative z-10 p-10 h-full flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent backdrop-blur-md">
                                        <Zap className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold mb-2">Internal Health</h3>
                                        <p className="text-muted-foreground text-lg leading-relaxed">
                                            Boost your energy, sleep quality, and mental clarity through active choices.
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-border/50">
                                    <div className="flex items-end gap-3">
                                        <span className="text-6xl font-black tracking-tight text-foreground">92</span>
                                        <span className="text-base font-bold text-accent mb-3 uppercase tracking-wide">Wellness Score</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>


                        {/* Card 2: Sustainability */}
                        <motion.div
                            initial={{ opacity: 0, x: 50, rotateY: -10 }}
                            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="glass-card p-0 rounded-[2.5rem] border-eco/20 bg-gradient-to-bl from-background/90 to-background/50 shadow-2xl relative group overflow-hidden h-full flex flex-col justify-between"
                            style={{ perspective: 1000 }}
                        >
                            {/* Chart Background */}
                            <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={landingData}>
                                        <defs>
                                            <linearGradient id="colorEcoLanding" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--eco-green))" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="hsl(var(--eco-green))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="co2Saved"
                                            stroke="hsl(var(--eco-green))"
                                            strokeWidth={4}
                                            fill="url(#colorEcoLanding)"
                                            animationDuration={2500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="absolute bottom-0 left-0 p-32 bg-eco/5 rounded-full blur-3xl group-hover:bg-eco/10 transition-colors duration-700" />

                            <div className="relative z-10 p-10 h-full flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="w-16 h-16 rounded-2xl bg-eco/10 flex items-center justify-center text-eco backdrop-blur-md">
                                        <Leaf className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold mb-2">External Planet</h3>
                                        <p className="text-muted-foreground text-lg leading-relaxed">
                                            Reduce your carbon footprint instantly by aligning lifestyle with nature.
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-border/50">
                                    <div className="flex items-end gap-3">
                                        <span className="text-6xl font-black tracking-tight text-foreground">12.5</span>
                                        <span className="text-base font-bold text-eco mb-3 uppercase tracking-wide">kg CO₂ Saved</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* 3. HOW IT WORKS */}
            <section className="py-32 px-6 bg-secondary/5 relative">
                <div className="max-w-6xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl font-bold tracking-tight">How It Works</h2>
                        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Three simple steps to a better you and a better planet.</p>
                    </motion.div>

                    {/* Cards Container */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Check in daily",
                                desc: "Log sleep, mood, and travel in seconds via our fluid interface.",
                                icon: Activity
                            },
                            {
                                step: "02",
                                title: "Understand patterns",
                                desc: "AI reveals how your habits affect energy and emissions simultaneously.",
                                icon: Brain
                            },
                            {
                                step: "03",
                                title: "Take meaningful action",
                                desc: "Small weekly missions improve you and the planet.",
                                icon: CheckCircle2
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2, duration: 0.6 }}
                                className="group relative p-10 rounded-3xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                            >
                                <div className="absolute top-0 right-0 p-8 text-6xl font-black text-muted-foreground/5 z-0 select-none">
                                    {item.step}
                                </div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors duration-500">
                                        <item.icon className="w-7 h-7 text-foreground/80 group-hover:text-primary transition-colors duration-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed text-lg">
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. AI COACH MOMENT */}
            <section className="py-20 md:py-40 px-6 relative overflow-hidden flex items-center justify-center">
                {/* Cinematic Backdrop */}
                <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background z-0" />
                <div className="absolute w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 animate-pulse-slow" />

                <div className="max-w-5xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-10"
                    >
                        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-card border-primary/30 shadow-lg backdrop-blur-md">
                            <Brain className="w-5 h-5 text-primary animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Live AI Insight Reference</span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-medium leading-[1.2] tracking-tight text-foreground/90 mx-auto max-w-4xl">
                            <span className="text-muted-foreground/50">"</span>This week, one cycling habit <span className="text-accent underline decoration-accent/30 underline-offset-8">improved your energy</span> and <span className="text-eco underline decoration-eco/30 underline-offset-8">prevented emissions</span> equal to planting a tree.<span className="text-muted-foreground/50">"</span>
                        </h2>
                    </motion.div>
                </div>
            </section>

            {/* 5. FINAL CTAs */}
            <section className="py-32 px-6 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-10"
                >
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Start seeing your life clearly.</h2>

                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center pt-8">
                        <Button
                            onClick={() => navigate("/onboarding")}
                            className="h-16 px-12 rounded-full text-xl font-bold shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 gap-3"
                        >
                            Get Started <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                    <div className="pt-8">
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">Designed for Gemini Developer Competition</p>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Landing;
