import { useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { Globe, Users, Leaf, TrendingUp, Trophy, ArrowUpRight, TreePine } from 'lucide-react'
import { useRef } from 'react'
import Navbar from '@/components/Navbar'
import { StorageService } from '@/services/storage'

const ease = [0.16, 1, 0.3, 1]

// Simulated community scale multiplier
const COMMUNITY_SIZE = 847
const COMMUNITY_MULTIPLIER = 142

function AnimatedCounter({ value, suffix = '', decimals = 1, className = '' }) {
    const [display, setDisplay] = useState(0)
    const ref = useRef(null)
    const inView = useInView(ref, { once: true })

    useEffect(() => {
        if (!inView) return
        const dur = 1500
        const start = Date.now()
        const tick = () => {
            const elapsed = Date.now() - start
            const progress = Math.min(elapsed / dur, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(eased * value)
            if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
    }, [inView, value])

    return (
        <span ref={ref} className={className}>
            {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}{suffix}
        </span>
    )
}

export default function Community() {
    const [communityStats, setCommunityStats] = useState({
        totalCo2Saved: 0,
        totalUsers: COMMUNITY_SIZE,
        avgPerUser: 0,
        treesEquivalent: 0,
        topContributors: [],
    })

    useEffect(() => {
        StorageService.init()
        const data = StorageService.getEntries()

        // Calculate user's CO₂ savings (vs all-car baseline)
        const userSaved = data.reduce((s, e) => s + Math.max(0, 2.5 - e.co2Emitted), 0)

        // Scale up to community
        const totalSaved = userSaved * COMMUNITY_MULTIPLIER
        const avgPerUser = totalSaved / COMMUNITY_SIZE

        setCommunityStats({
            totalCo2Saved: parseFloat(totalSaved.toFixed(1)),
            totalUsers: COMMUNITY_SIZE,
            avgPerUser: parseFloat(avgPerUser.toFixed(1)),
            treesEquivalent: Math.round(totalSaved / 21), // ~21kg CO2 per tree/year
            topContributors: [
                { name: 'Ananya S.', saved: parseFloat((userSaved * 1.3).toFixed(1)), streak: 14 },
                { name: 'You', saved: parseFloat(userSaved.toFixed(1)), streak: data.length },
                { name: 'Rohan K.', saved: parseFloat((userSaved * 0.9).toFixed(1)), streak: 11 },
                { name: 'Priya M.', saved: parseFloat((userSaved * 0.75).toFixed(1)), streak: 8 },
                { name: 'Arjun D.', saved: parseFloat((userSaved * 0.6).toFixed(1)), streak: 6 },
            ],
        })
    }, [])

    const tonsSaved = (communityStats.totalCo2Saved / 1000).toFixed(1)

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            <Navbar />
            <main className="pt-28 pb-16 px-6 max-w-7xl mx-auto space-y-8">

                {/* -- Hero Banner -- */}
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease }}
                    className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center"
                    style={{
                        background: 'linear-gradient(135deg, rgba(45,212,191,0.12) 0%, rgba(16,185,129,0.08) 50%, rgba(34,197,94,0.12) 100%)',
                        boxShadow: '0 0 80px -20px rgba(45,212,191,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                        border: '1px solid rgba(45,212,191,0.15)',
                    }}
                >
                    {/* Animated orbs */}
                    <div className="absolute -top-20 -left-20 w-52 h-52 rounded-full bg-[var(--color-eco)]/10 blur-3xl animate-pulse" />
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-[var(--color-accent)]/8 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[var(--color-eco)]/5 blur-3xl" />

                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, duration: 0.6, type: 'spring', stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-eco)]/15 mb-6"
                        >
                            <Globe size={32} className="text-[var(--color-eco)]" />
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6, ease }}
                            className="text-sm font-semibold text-[var(--color-eco)] uppercase tracking-[0.2em] mb-3"
                        >
                            🌍 Community Impact This Month
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.7, ease }}
                        >
                            <div className="flex items-baseline justify-center gap-2 mb-2">
                                <AnimatedCounter
                                    value={parseFloat(tonsSaved)}
                                    suffix=""
                                    decimals={1}
                                    className="font-display text-7xl sm:text-8xl font-bold text-[var(--color-eco)] tabular-nums"
                                />
                                <span className="text-3xl font-bold text-[var(--color-eco)]/70">tons</span>
                            </div>
                            <p className="text-lg text-[var(--color-text-secondary)] font-medium">CO₂ reduced collectively</p>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="mt-4 text-sm text-[var(--color-text-muted)]"
                        >
                            {communityStats.totalUsers.toLocaleString()} members working toward a sustainable future
                        </motion.p>
                    </div>
                </motion.div>

                {/* -- Stats Grid -- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { label: 'Active Members', value: `${communityStats.totalUsers}`, icon: Users, accent: 'var(--color-brand)' },
                        { label: 'Avg. Saved / User', value: `${communityStats.avgPerUser} kg`, icon: Leaf, accent: 'var(--color-eco)' },
                        { label: 'Trees Equivalent', value: `${communityStats.treesEquivalent}`, icon: TreePine, accent: 'var(--color-accent)' },
                        { label: 'Total CO₂ Saved', value: `${communityStats.totalCo2Saved} kg`, icon: TrendingUp, accent: 'var(--color-health)' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 25, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease }}
                            whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.3 } }}
                            className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] border-l-[3px] hover:border-[var(--color-border-hover)] transition-all duration-300"
                            style={{ borderLeftColor: stat.accent, boxShadow: `0 0 30px -15px ${stat.accent}` }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold tracking-[0.12em] uppercase" style={{ color: stat.accent }}>{stat.label}</span>
                                <stat.icon size={16} style={{ color: stat.accent }} />
                            </div>
                            <span className="font-display text-3xl font-bold">{stat.value}</span>
                        </motion.div>
                    ))}
                </div>

                {/* -- Leaderboard -- */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease }}
                    className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 hover:border-[var(--color-border-hover)] transition-colors duration-300"
                >
                    <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-6">
                        <Trophy size={18} className="text-[var(--color-accent)]" />
                        Top Contributors
                    </h2>
                    <div className="space-y-3">
                        {communityStats.topContributors.map((user, i) => {
                            const isYou = user.name === 'You'
                            const medals = ['🥇', '🥈', '🥉']
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -15 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08, duration: 0.5, ease }}
                                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${isYou
                                            ? 'bg-[var(--color-accent)]/5 border-[var(--color-accent)]/20'
                                            : 'bg-[var(--color-bg)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                                        }`}
                                >
                                    <span className="text-xl w-8 text-center">{medals[i] || `#${i + 1}`}</span>
                                    <div className="flex-1">
                                        <p className={`text-sm font-semibold ${isYou ? 'text-[var(--color-accent)]' : ''}`}>
                                            {user.name} {isYou && '⭐'}
                                        </p>
                                        <p className="text-[11px] text-[var(--color-text-muted)]">{user.streak}-day streak</p>
                                    </div>
                                    <span className="font-display text-lg font-bold text-[var(--color-eco)]">
                                        {user.saved} <span className="text-xs font-medium text-[var(--color-text-muted)]">kg</span>
                                    </span>
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
