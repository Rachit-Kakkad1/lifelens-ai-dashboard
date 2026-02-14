import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Zap, MapPin, Navigation, Info, ArrowRight,
    Sparkles, Train, Bike, Footprints, Car, AlertTriangle, Brain, Leaf, TrendingDown, Bus
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import FreeMap from '@/components/FreeMap' // Switched to Leaflet
import { getAITravelAdvice } from '@/services/llmRouteAdvisor' // Switched to Real AI reasoning
import { clsx } from 'clsx'
import { StorageService } from '@/services/storage'

const ease = [0.16, 1, 0.3, 1]

const TRANSPORT_META = {
    walk: { label: 'Walk', icon: Footprints, co2: 0, energy: '+20%', color: 'var(--color-accent)' },
    cycle: { label: 'Cycle', icon: Bike, co2: 0, energy: '+18%', color: 'var(--color-eco)' },
    public: { label: 'Transit', icon: Bus, co2: 0.5, energy: '+5%', color: 'var(--color-brand)' },
    car: { label: 'Car', icon: Car, co2: 2.5, energy: '0%', color: 'var(--color-warn)' },
}



export default function Travel() {
    const [distance, setDistance] = useState(null)
    const [aiText, setAiText] = useState("Select two points on the map to get AI travel intelligence.")
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState({
        walk: 0,
        cycle: 0,
        public: 0,
        car: 0,
        totalSavings: 0
    })

    useEffect(() => {
        StorageService.init()
        const entries = StorageService.getEntries()
        if (entries.length > 0) {
            const walk = entries.filter(e => e.transport === 'walk').length
            const cycle = entries.filter(e => e.transport === 'cycle').length
            const publicTxt = entries.filter(e => e.transport === 'public').length
            const car = entries.filter(e => e.transport === 'car').length

            const savings = entries.reduce((s, e) => {
                return s + (e.co2Emitted ? (2.5 - e.co2Emitted) : 0)
            }, 0)

            setStats({ walk, cycle, public: publicTxt, car, totalSavings: savings.toFixed(1) })
        }
    }, [])

    useEffect(() => {
        if (distance) {
            setLoading(true)
            getAITravelAdvice(distance).then(text => {
                setAiText(text)
                setLoading(false)
            })
        } else {
            setAiText("Select two points on the map to get AI travel intelligence.")
        }
    }, [distance])

    return (
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
            <Navbar />

            <main className="pt-28 pb-16 px-6 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                            <Navigation size={18} className="text-[var(--color-accent)]" />
                        </div>
                        <h1 className="font-display text-3xl font-bold tracking-tight">Travel Intelligence</h1>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        AI-powered route analysis & low-carbon recommendations.
                    </p>
                </motion.div>

                {/* Features Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Map & Input */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.8, ease }}
                            className="glass-premium rounded-3xl overflow-hidden p-6 border border-[var(--color-border)] shadow-2xl space-y-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-display font-medium text-sm flex items-center gap-2">
                                    <MapPin size={14} className="text-[var(--color-accent)]" />
                                    Interactive Route Selection
                                </h3>
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[10px] uppercase font-bold tracking-widest border border-[var(--color-accent)]/20 shadow-sm animate-pulse">
                                    Live OpenSource Routing
                                </div>
                            </div>

                            <FreeMap onDistance={setDistance} />

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="p-4 rounded-2xl bg-[var(--color-bg)]/50 border border-[var(--color-border)]">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-text-muted)] mb-1">Route Distance</p>
                                    <p className="font-display text-2xl font-bold text-[var(--color-text)]">
                                        {distance ? `${distance.toFixed(2)} km` : "--"}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-[var(--color-bg)]/50 border border-[var(--color-border)]">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-text-muted)] mb-1">Est. Car Carbon</p>
                                    <p className="font-display text-2xl font-bold text-[var(--color-warn)]/80">
                                        {distance ? `${(distance * 0.21).toFixed(2)} kg CO₂` : "--"}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: AI Panel */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.8, ease }}
                            className="glass-premium rounded-3xl p-8 border border-[var(--color-eco)]/30 shadow-2xl relative overflow-hidden flex flex-col h-full min-h-[420px]"
                            style={{ boxShadow: '0 0 60px -20px var(--color-eco)' }}
                        >
                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-eco)]/5 blur-3xl rounded-full" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--color-eco)]/10 flex items-center justify-center">
                                        <Sparkles size={20} className="text-[var(--color-eco)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-bold text-lg">AI Route Decision</h3>
                                        <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold">Neural Engine Reasoning</p>
                                    </div>
                                </div>

                                <div className="flex-1 bg-[var(--color-bg)]/40 rounded-2xl p-5 border border-[var(--color-border)] mb-6 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-bold text-[var(--color-eco)] uppercase tracking-widest">Analysis:</span>
                                        <span className="px-2 py-0.5 rounded-md bg-[var(--color-eco)]/10 text-[var(--color-eco)] text-[10px] font-bold uppercase tracking-widest border border-[var(--color-eco)]/20">
                                            Target 2030
                                        </span>
                                    </div>
                                    {loading ? (
                                        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                                            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-eco)] border-t-transparent animate-spin" />
                                            <p className="text-xs text-[var(--color-text-secondary)] font-medium text-center">AI Reasoning In Progress...</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-medium italic">
                                            &ldquo;{aiText}&rdquo;
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="text-[var(--color-text-muted)] uppercase tracking-wider">Potential Monthly Savings</span>
                                        <span className="text-[var(--color-eco)]">
                                            {distance ? `${(distance * 0.16 * 20).toFixed(1)} kg` : "0.0 kg"}
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)]">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: distance ? '85%' : '0%' }}
                                            transition={{ duration: 1, ease }}
                                            className="h-full bg-gradient-to-r from-[var(--color-eco)] to-[var(--color-accent)]"
                                        />
                                    </div>
                                    <p className="text-[10px] text-[var(--color-text-muted)] text-center font-medium leading-relaxed">
                                        Personalized based on your historical patterns & local climate goals.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>

                {/* Activity Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {[
                        { label: 'Walking Trips', val: stats.walk, icon: Footprints, color: 'var(--color-eco)' },
                        { label: 'Cycling Trips', val: stats.cycle, icon: Bike, color: 'var(--color-accent)' },
                        { label: 'Transit Trips', val: stats.public, icon: Bus, color: 'var(--color-brand)' },
                        { label: 'Car Trips', val: stats.car, icon: Car, color: 'var(--color-warn)' },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease }}
                            className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] border-l-[3px] space-y-3"
                            style={{ borderLeftColor: item.color }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">{item.label}</span>
                                <item.icon size={16} style={{ color: item.color }} />
                            </div>
                            <p className="font-display text-3xl font-bold">{item.val}</p>
                        </motion.div>
                    ))}
                </div>

            </main>
        </div>
    )
}
