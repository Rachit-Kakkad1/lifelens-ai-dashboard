import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Bike, Bus, Car, Footprints, Leaf, Zap, ArrowRight, TrendingDown, Brain, Search, Navigation } from 'lucide-react'
import clsx from 'clsx'
import Navbar from '@/components/Navbar'
import { StorageService } from '@/services/storage'
import RouteMap from '@/components/RouteMap'
import { getRouteDecision } from '@/services/aiRouteDecision'
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api'

const ease = [0.16, 1, 0.3, 1]
const libraries = ['places']

const CO2_FACTORS = { walk: 0, cycle: 0, public: 0.5, car: 2.5 }
const TRANSPORT_META = {
    walk: { label: 'Walk', icon: Footprints, co2: 0, energy: '+20%', color: 'var(--color-accent)' },
    cycle: { label: 'Cycle', icon: Bike, co2: 0, energy: '+18%', color: 'var(--color-eco)' },
    public: { label: 'Transit', icon: Bus, co2: 0.5, energy: '+5%', color: 'var(--color-brand)' },
    car: { label: 'Car', icon: Car, co2: 2.5, energy: '0%', color: 'var(--color-warn)' },
}

function generateBestNextMove(entries) {
    if (!entries || entries.length === 0) {
        return {
            suggestion: 'Start tracking your commutes to get personalized travel advice.',
            savings: 0,
            from: 'car',
            to: 'cycle',
            confidence: 'Low',
        }
    }

    const latest = entries[entries.length - 1]
    const recentModes = entries.slice(-5).map(e => e.transport)

    // Find the most frequent high-emission mode
    const carCount = recentModes.filter(t => t === 'car').length
    const publicCount = recentModes.filter(t => t === 'public').length

    if (latest.transport === 'car' || carCount >= 2) {
        return {
            suggestion: 'Use metro instead of car tomorrow',
            savings: parseFloat((CO2_FACTORS.car - CO2_FACTORS.public).toFixed(1)),
            from: 'car',
            to: 'public',
            detail: 'Based on your commute pattern, switching to metro for your next trip would have the highest emission impact.',
            confidence: entries.length >= 5 ? 'High' : 'Moderate',
        }
    }

    if (latest.transport === 'public' || publicCount >= 2) {
        return {
            suggestion: 'Try cycling instead of transit tomorrow',
            savings: parseFloat((CO2_FACTORS.public - CO2_FACTORS.cycle).toFixed(1)),
            from: 'public',
            to: 'cycle',
            detail: 'You\'re already lower-emission. Cycling would eliminate your commute emissions entirely.',
            confidence: entries.length >= 5 ? 'High' : 'Moderate',
        }
    }

    // User is already low-emission
    return {
        suggestion: 'Maintain your active commute streak!',
        savings: 0,
        from: latest.transport,
        to: latest.transport,
        detail: 'You\'re already at near-zero transport emissions. Keep it up!',
        confidence: 'High',
    }
}

export default function Travel() {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
        libraries,
    })

    const [bestMove, setBestMove] = useState(null)
    const [weeklyBreakdown, setWeeklyBreakdown] = useState([])
    const [weeklyTotal, setWeeklyTotal] = useState(0)

    // Live Routing State
    const [routeDecision, setRouteDecision] = useState('Analyzing route impact...')
    const [directions, setDirections] = useState(null)
    const [distance, setDistance] = useState(8.2) // Default demo distance
    const [duration, setDuration] = useState('22 mins')

    const originRef = useRef(null)
    const destRef = useRef(null)

    async function calculateRoute() {
        if (!originRef.current || !destRef.current) return
        const origin = originRef.current.value
        const destination = destRef.current.value
        if (!origin || !destination) return

        setRouteDecision('Calculating optimal eco-route...')

        try {
            // eslint-disable-next-line no-undef
            const directionsService = new google.maps.DirectionsService()
            const results = await directionsService.route({
                origin,
                destination,
                // eslint-disable-next-line no-undef
                travelMode: google.maps.TravelMode.DRIVING
            })

            if (results.status === 'OK') {
                setDirections(results)
                const leg = results.routes[0].legs[0]
                const distKm = parseFloat((leg.distance.value / 1000).toFixed(1))
                setDistance(distKm)
                setDuration(leg.duration.text)

                // Get AI Decision for new route
                const decision = await getRouteDecision(distKm)
                setRouteDecision(decision)
            }
        } catch (error) {
            console.error('Route failed:', error)
            setRouteDecision('Route calculation failed. Using optimal fallback.')
        }
    }

    useEffect(() => {
        StorageService.init()
        const data = StorageService.getEntries()
        setBestMove(generateBestNextMove(data))

        // Initial check
        getRouteDecision(8.2).then(setRouteDecision)

        // Weekly breakdown
        const recent = data.slice(-7)
        const breakdown = Object.keys(TRANSPORT_META).map(mode => {
            const count = recent.filter(e => e.transport === mode).length
            const co2 = count * CO2_FACTORS[mode]
            return { mode, count, co2: parseFloat(co2.toFixed(1)), ...TRANSPORT_META[mode] }
        })
        setWeeklyBreakdown(breakdown)
        setWeeklyTotal(parseFloat(recent.reduce((s, e) => s + e.co2Emitted, 0).toFixed(1)))
    }, [])

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            <Navbar />
            <main className="pt-28 pb-16 px-6 max-w-6xl mx-auto space-y-8">

                {/* -- Header -- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4"
                >
                    <div>
                        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Travel Intelligence</h1>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            AI-powered commute suggestions to minimize your carbon footprint.
                        </p>
                    </div>
                </motion.div>

                {/* -- Google Map Strategy -- */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    {/* Map Container */}
                    <div className="lg:col-span-2 h-[500px] flex flex-col gap-4">
                        {/* Search Bar Overlay */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {isLoaded ? (
                                <>
                                    <Autocomplete>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"><MapPin size={16} /></div>
                                            <input
                                                ref={originRef}
                                                type="text"
                                                placeholder="Start Location"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm font-medium shadow-sm"
                                            />
                                        </div>
                                    </Autocomplete>
                                    <div className="flex gap-3">
                                        <Autocomplete className="flex-1">
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"><Navigation size={16} /></div>
                                                <input
                                                    ref={destRef}
                                                    type="text"
                                                    placeholder="Destination"
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm font-medium shadow-sm"
                                                />
                                            </div>
                                        </Autocomplete>
                                        <button
                                            onClick={calculateRoute}
                                            className="px-5 py-3 rounded-xl bg-[var(--color-accent)] text-white font-bold text-sm shadow-lg shadow-[var(--color-accent)]/20 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Go
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="col-span-2 h-12 bg-[var(--color-surface)] rounded-xl animate-pulse" />
                            )}
                        </div>

                        <div className="flex-1 rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-2xl relative group">
                            <RouteMap isLoaded={isLoaded} directions={directions} />

                            {/* Route Info Badge */}
                            <div className="absolute bottom-4 left-4 bg-[var(--color-surface)]/95 backdrop-blur px-4 py-2 rounded-xl border border-[var(--color-border)] shadow-xl flex items-center gap-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)]">Distance</p>
                                    <p className="font-display font-bold text-lg">{distance} km</p>
                                </div>
                                <div className="w-px h-8 bg-[var(--color-border)]" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)]">Time</p>
                                    <p className="font-display font-bold text-lg">{duration}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Decision Panel */}
                    <div className="flex flex-col gap-4">
                        <div className="flex-1 p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-eco)]/30 relative overflow-hidden flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03]"><Brain size={150} /></div>

                            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2 text-[var(--color-eco)]">
                                <Brain size={20} /> AI Recommendation
                            </h3>

                            <div className="relative z-10 glass-panel p-5 rounded-xl bg-[var(--color-bg)]/50 border border-[var(--color-eco)]/20 mb-6">
                                <p className="font-display text-lg font-medium leading-relaxed text-[var(--color-text)]/90 italic">
                                    &ldquo;{routeDecision}&rdquo;
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg)]/50 border border-[var(--color-border)]">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-eco)]/10 flex items-center justify-center">
                                        <Leaf size={14} className="text-[var(--color-eco)]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Potential Savings</p>
                                        <p className="font-display font-bold text-[var(--color-eco)]">~{(distance * 0.2).toFixed(1)} kg CO₂</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg)]/50 border border-[var(--color-border)]">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-brand)]/10 flex items-center justify-center">
                                        <Zap size={14} className="text-[var(--color-brand)]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">AI Rating</p>
                                        <p className="font-display font-bold text-[var(--color-text)]">Eco-Optimized</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* -- Best Next Move Hero Card -- */}
                {bestMove && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.8, ease }}
                        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 group"
                        style={{
                            background: 'linear-gradient(135deg, rgba(45,212,191,0.08) 0%, rgba(16,185,129,0.05) 100%)',
                            border: '1px solid rgba(45,212,191,0.15)',
                            boxShadow: '0 0 60px -20px rgba(45,212,191,0.15)',
                        }}
                    >
                        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[var(--color-eco)]/5 blur-3xl group-hover:bg-[var(--color-eco)]/10 transition-all duration-700" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-[var(--color-eco)]/10 flex items-center justify-center">
                                    <Brain size={20} className="text-[var(--color-eco)]" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-eco)]">Best Next Action</p>
                                    <p className="text-[11px] text-[var(--color-text-muted)]">{bestMove.confidence} confidence</p>
                                </div>
                            </div>

                            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
                                {bestMove.suggestion}
                            </h2>

                            {bestMove.savings > 0 && (
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const FromIcon = TRANSPORT_META[bestMove.from]?.icon || Car
                                            const ToIcon = TRANSPORT_META[bestMove.to]?.icon || Bike
                                            return (
                                                <>
                                                    <div className="w-10 h-10 rounded-xl bg-[var(--color-warn)]/10 flex items-center justify-center">
                                                        <FromIcon size={18} className="text-[var(--color-warn)]" />
                                                    </div>
                                                    <ArrowRight size={16} className="text-[var(--color-text-muted)]" />
                                                    <div className="w-10 h-10 rounded-xl bg-[var(--color-eco)]/10 flex items-center justify-center">
                                                        <ToIcon size={18} className="text-[var(--color-eco)]" />
                                                    </div>
                                                </>
                                            )
                                        })()}
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-eco)]/8 border border-[var(--color-eco)]/15">
                                        <TrendingDown size={14} className="text-[var(--color-eco)]" />
                                        <span className="font-display text-lg font-bold text-[var(--color-eco)]">Save {bestMove.savings} kg CO₂</span>
                                    </div>
                                </div>
                            )}

                            {bestMove.detail && (
                                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">{bestMove.detail}</p>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* -- Transport Comparison -- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {weeklyBreakdown.map((item, i) => (
                        <motion.div
                            key={item.mode}
                            initial={{ opacity: 0, y: 25, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease }}
                            whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.3 } }}
                            className={clsx(
                                'p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] border-l-[3px] hover:border-[var(--color-border-hover)] transition-all duration-300',
                            )}
                            style={{ borderLeftColor: item.color, boxShadow: item.count > 0 ? `0 0 30px -15px ${item.color}` : undefined }}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <item.icon size={16} style={{ color: item.color }} />
                                <span className="text-xs font-semibold tracking-[0.12em] uppercase" style={{ color: item.color }}>{item.label}</span>
                            </div>
                            <p className="font-display text-3xl font-bold mb-1">{item.count}<span className="text-sm font-medium text-[var(--color-text-muted)]"> trips</span></p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                                {item.co2} kg CO₂ · Energy {item.energy}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* -- Weekly Summary -- */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease }}
                    className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 hover:border-[var(--color-border-hover)] transition-colors duration-300"
                >
                    <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-5">
                        <MapPin size={18} className="text-[var(--color-brand)]" />
                        Weekly Travel Summary
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Total Emissions</p>
                            <p className="font-display text-2xl font-bold">{weeklyTotal} <span className="text-sm font-medium text-[var(--color-text-muted)]">kg CO₂</span></p>
                        </div>
                        <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Daily Average</p>
                            <p className="font-display text-2xl font-bold">{(weeklyTotal / 7).toFixed(1)} <span className="text-sm font-medium text-[var(--color-text-muted)]">kg/day</span></p>
                        </div>
                        <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Best Mode</p>
                            <p className="font-display text-2xl font-bold text-[var(--color-eco)]">
                                {weeklyBreakdown.length > 0
                                    ? weeklyBreakdown.reduce((best, cur) => cur.count > best.count && cur.co2 <= best.co2 ? cur : best, weeklyBreakdown[0]).label
                                    : '—'}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
