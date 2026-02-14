import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  Zap, Leaf, TrendingUp, Brain, Clock, Calendar, Target, ArrowUpRight,
  Sparkles, Bike, Bus, CheckCircle2, Moon
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import { StorageService } from '@/services/storage'
import { calculateSustainabilityScore } from '@/logic/wellness'
import { generateCoachInsight } from '@/logic/coach'
import { generatePredictiveInsight } from '@/logic/aiPredictor'
import { generateWeeklyPlan } from '@/logic/weeklyPlan'
import { getAIPrediction, getAIWeeklyPlan, parseAIWeeklyPlan, checkAIStatus } from '@/services/ai'

const ease = [0.16, 1, 0.3, 1]

function MetricCard({ label, value, sub, icon: Icon, accent, border, glow, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease }}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } }}
      className={`p-7 rounded-2xl bg-[var(--color-surface)] border-l-[3px] ${border} border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-300`}
      style={glow ? { boxShadow: `0 0 40px -15px ${glow}` } : undefined}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-semibold tracking-[0.12em] uppercase ${accent}`}>{label}</span>
        <motion.div
          whileHover={{ rotate: 12, scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          <Icon size={18} className={accent} />
        </motion.div>
      </div>
      <div className="flex items-end gap-2">
        <span className="font-display text-5xl font-bold text-[var(--color-text)] tabular-nums">{value}</span>
        <span className="text-sm text-[var(--color-text-secondary)] mb-1.5 font-medium">{sub}</span>
      </div>
    </motion.div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-elevated)] border border-[var(--color-border-hover)] rounded-xl px-4 py-3 shadow-xl"
    >
      <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </motion.div>
  )
}

export default function Dashboard() {
  const [wellnessScore, setWellnessScore] = useState(0)
  const [sustainScore, setSustainScore] = useState(0)
  const [entries, setEntries] = useState([])
  const [insight, setInsight] = useState(null)
  const [projection, setProjection] = useState({ valid: false, text: '', positive: false })
  const [lastCheckIn, setLastCheckIn] = useState('No data')
  const [journeyDay, setJourneyDay] = useState(1)
  const [dataCount, setDataCount] = useState(0)
  const [aiPrediction, setAiPrediction] = useState(null)
  const [weeklyPlan, setWeeklyPlan] = useState(null)
  const [aiText, setAiText] = useState(null)
  const [aiStatus, setAiStatus] = useState('checking') // 'checking' | 'online' | 'offline'
  const chartRef = useRef(null)
  const chartInView = useInView(chartRef, { once: true, margin: '-50px' })

  useEffect(() => {
    StorageService.init()
    const data = StorageService.getEntries()
    if (data.length === 0) return

    const latest = data[data.length - 1]
    setWellnessScore(latest.wellnessScore)
    setDataCount(data.length)

    const d = new Date(latest.timestamp)
    const isToday = d.toDateString() === new Date().toDateString()
    setLastCheckIn(isToday
      ? `Today, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
      : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`
    )

    const first = data[0]
    setJourneyDay(Math.ceil(Math.abs(Date.now() - first.timestamp) / 864e5) || 1)

    const sumCo2 = data.reduce((s, e) => s + e.co2Emitted, 0)
    setSustainScore(calculateSustainabilityScore(sumCo2))
    setInsight(generateCoachInsight(data))
    setAiPrediction(generatePredictiveInsight(data))
    setWeeklyPlan(generateWeeklyPlan(data))

      // Async: Try LM Studio AI enhancement
      ; (async () => {
        const status = await checkAIStatus()
        if (status.online) {
          setAiStatus('online')
          // Get AI prediction text
          const predText = await getAIPrediction(data)
          if (predText) setAiText(predText)
          // Get AI weekly plan
          const planText = await getAIWeeklyPlan(data)
          if (planText) {
            const parsed = parseAIWeeklyPlan(planText)
            if (parsed && parsed.actions.length > 0) setWeeklyPlan(parsed)
          }
        } else {
          setAiStatus('offline')
        }
      })()

    const last3 = data.slice(-3)
    const recentActive = last3.filter(e => e.transport === 'cycle' || e.transport === 'walk').length
    const weeklyScore = data.reduce((a, e) => {
      if (e.transport === 'cycle' || e.transport === 'walk') return a + 1
      if (e.transport === 'public') return a + 0.5
      return a
    }, 0)
    const isPositive = recentActive >= 1 && weeklyScore >= 2
    setProjection({
      valid: true,
      positive: isPositive,
      text: isPositive
        ? 'Continue this pattern: +12% avg energy, -9 kg CO2 this month'
        : 'Without change: energy plateau, +15 kg CO2 this month',
    })

    setEntries(data.slice(-7).map(e => ({
      day: new Date(e.date).toLocaleDateString('en-US', { weekday: 'short' }),
      wellness: e.wellnessScore,
      co2: e.co2Emitted * 20,
      rawCo2: e.co2Emitted,
    })))
  }, [])

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <main className="pt-28 pb-16 px-6 max-w-7xl mx-auto space-y-8">

        {/* -- Status Bar -- */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="flex flex-wrap gap-3 text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider"
        >
          {[
            { icon: Clock, label: 'Last check-in', val: lastCheckIn, color: 'var(--color-brand)' },
            { icon: Calendar, label: 'Day', val: journeyDay, color: 'var(--color-accent)' },
            { icon: Target, label: 'Data points', val: dataCount, color: 'var(--color-eco)' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
            >
              <s.icon size={12} style={{ color: s.color }} />
              <span>{s.label}: <span className="text-[var(--color-text)]">{s.val}</span></span>
            </motion.div>
          ))}
        </motion.div>

        {/* -- Page Title -- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
        >
          <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Live Biometric & Climate Sync</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Insights generated from your real behavior patterns
          </p>
        </motion.div>

        {/* -- Score Cards -- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <MetricCard
            label="Internal Health"
            value={wellnessScore}
            sub="wellness"
            icon={Zap}
            accent="text-[var(--color-health)]"
            border="border-l-[var(--color-health)]"
            glow="var(--color-health)"
            delay={0.15}
          />
          <MetricCard
            label="External Planet"
            value={sustainScore}
            sub="sustain"
            icon={Leaf}
            accent="text-[var(--color-eco)]"
            border="border-l-[var(--color-eco)]"
            glow="var(--color-eco)"
            delay={0.25}
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.7, ease }}
            whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.3 } }}
            className={`p-7 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] border-l-[3px] flex flex-col justify-center ${projection.positive ? 'border-l-[var(--color-eco)]' : 'border-l-[var(--color-warn)]'
              }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold tracking-[0.12em] uppercase ${projection.positive ? 'text-[var(--color-eco)]' : 'text-[var(--color-warn)]'
                }`}>7-Day Projection</span>
              <TrendingUp size={18} className={projection.positive ? 'text-[var(--color-eco)]' : 'text-[var(--color-warn)]'} />
            </div>
            <p className="text-sm font-medium leading-relaxed mb-3">
              {projection.valid ? projection.text : 'Log more data to unlock projections.'}
            </p>
            <div className="pt-3 border-t border-[var(--color-border)]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Confidence: <span className={dataCount > 5 ? 'text-[var(--color-eco)]' : 'text-[var(--color-warn)]'}>
                  {dataCount > 14 ? 'High' : dataCount > 5 ? 'Moderate' : 'Low'}
                </span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* -- Future Carbon Projection Engine (The Brain) -- */}
        {dataCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease }}
            className="rounded-2xl relative overflow-hidden p-1 bg-gradient-to-r from-[var(--color-warn)] via-[var(--color-surface)] to-[var(--color-eco)] shadow-2xl"
          >
            <div className="absolute inset-0 bg-[var(--color-surface)] m-[1px] rounded-2xl" />

            <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center justify-between">

              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-brand)]/10 flex items-center justify-center animate-pulse">
                    <Clock size={20} className="text-[var(--color-brand)]" />
                  </div>
                  <h2 className="font-display text-2xl font-bold bg-gradient-to-r from-[var(--color-text)] to-[var(--color-text-secondary)] bg-clip-text text-transparent">
                    Your Climate Future
                  </h2>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] max-w-md leading-relaxed">
                  Based on your current trajectory, we've projected your annual carbon footprint.
                  <span className="text-[var(--color-text)] font-medium"> Small changes today redefine your 2030.</span>
                </p>
              </div>

              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Current Path */}
                <div className="p-5 rounded-xl bg-[var(--color-bg)]/80 border border-[var(--color-warn)]/30 relative group">
                  <div className="absolute -top-3 left-4 px-2 py-0.5 bg-[var(--color-warn)]/10 text-[var(--color-warn)] text-[10px] uppercase font-bold tracking-wider rounded border border-[var(--color-warn)]/20">
                    Current Path
                  </div>
                  <p className="font-display text-3xl font-bold text-[var(--color-warn)] mb-1">
                    {(() => {
                      const recent = entries.slice(-7) || []
                      const avgDaily = recent.reduce((s, e) => s + e.rawCo2, 0) / (recent.length || 1)
                      return (avgDaily * 365 / 1000).toFixed(1)
                    })()}
                    <span className="text-sm text-[var(--color-text-muted)] font-medium ml-1">tons/yr</span>
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    ⚠ Unsustainable by 2030
                  </p>
                </div>

                {/* AI Path */}
                <div className="p-5 rounded-xl bg-[var(--color-eco)]/10 border border-[var(--color-eco)]/40 relative shadow-[0_0_30px_-10px_var(--color-eco)]">
                  <div className="absolute -top-3 left-4 px-2 py-0.5 bg-[var(--color-eco)] text-[var(--color-bg)] text-[10px] uppercase font-bold tracking-wider rounded shadow-sm flex items-center gap-1">
                    <Sparkles size={10} /> AI Optimized
                  </div>
                  <p className="font-display text-3xl font-bold text-[var(--color-eco)] mb-1">
                    {(() => {
                      const recent = entries.slice(-7) || []
                      const avgDaily = recent.reduce((s, e) => s + e.rawCo2, 0) / (recent.length || 1)
                      // AI optimizes by ~40%
                      return ((avgDaily * 365 / 1000) * 0.6).toFixed(1)
                    })()}
                    <span className="text-sm text-[var(--color-text-muted)] font-medium ml-1">tons/yr</span>
                  </p>
                  <p className="text-xs text-[var(--color-eco)] font-medium">
                    ✅ Paris Agreement Aligned
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* -- Predictive AI Insight Card -- */}
        {aiPrediction && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-all duration-500 group"
            style={{ boxShadow: '0 0 60px -20px rgba(45,212,191,0.15)' }}
          >
            {/* Animated glow background */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--color-accent)]/5 blur-3xl group-hover:bg-[var(--color-accent)]/10 transition-all duration-700" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[var(--color-eco)]/5 blur-3xl" />

            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
                  <Sparkles size={20} className="text-[var(--color-accent)]" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold">Predictive AI Insight</h2>
                  <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold flex items-center gap-2">
                    {aiStatus === 'online' ? (
                      <><span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-eco)] animate-pulse" /> LM Studio AI — Live</>
                    ) : aiStatus === 'checking' ? (
                      <><span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-warn)] animate-pulse" /> Connecting to AI...</>
                    ) : (
                      <><span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" /> Neural Engine Active</>
                    )}
                  </p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${aiPrediction.confidence === 'High'
                  ? 'bg-[var(--color-eco)]/10 text-[var(--color-eco)] border-[var(--color-eco)]/20'
                  : aiPrediction.confidence === 'Moderate'
                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20'
                    : 'bg-[var(--color-warn)]/10 text-[var(--color-warn)] border-[var(--color-warn)]/20'
                  }`}>
                  {aiPrediction.confidence} confidence
                </span>
              </div>

              {/* Main prediction text */}
              {aiText ? (
                <p className="font-display text-lg sm:text-xl font-medium leading-relaxed text-[var(--color-text)]/90 mb-6 italic">
                  &ldquo;{aiText}&rdquo;
                </p>
              ) : (
                <p className="font-display text-xl sm:text-2xl font-medium leading-relaxed text-[var(--color-text)]/90 mb-6">
                  🎯 {aiPrediction.opportunity}
                </p>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ y: -2, transition: { duration: 0.25 } }}
                  className="p-5 rounded-xl bg-[var(--color-bg)]/60 backdrop-blur-sm border border-[var(--color-border)] hover:border-[var(--color-eco)]/30 transition-all duration-300"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-eco)] mb-2">Monthly CO₂ Savings</p>
                  <div className="flex items-end gap-1">
                    <span className="font-display text-4xl font-bold text-[var(--color-eco)]">{aiPrediction.monthlySavings}</span>
                    <span className="text-sm text-[var(--color-text-muted)] mb-1.5 font-medium">kg</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2, transition: { duration: 0.25 } }}
                  className="p-5 rounded-xl bg-[var(--color-bg)]/60 backdrop-blur-sm border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-all duration-300"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-2">Reduction Potential</p>
                  <div className="flex items-end gap-1">
                    <span className="font-display text-4xl font-bold text-[var(--color-accent)]">{aiPrediction.reductionPct}</span>
                    <span className="text-sm text-[var(--color-text-muted)] mb-1.5 font-medium">%</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2, transition: { duration: 0.25 } }}
                  className="p-5 rounded-xl bg-[var(--color-bg)]/60 backdrop-blur-sm border border-[var(--color-border)] hover:border-[var(--color-brand)]/30 transition-all duration-300"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-brand)] mb-2">Time to Sustainable</p>
                  <span className="font-display text-2xl font-bold text-[var(--color-brand)]">{aiPrediction.timeToTarget}</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* -- Weekly Action Plan Card -- */}
        {weeklyPlan && weeklyPlan.actions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease }}
            whileHover={{ y: -3, transition: { duration: 0.3 } }}
            className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] border-l-[3px] border-l-[var(--color-eco)] p-6 sm:p-8 hover:border-[var(--color-border-hover)] transition-all duration-300 relative overflow-hidden"
            style={{ boxShadow: '0 0 40px -15px var(--color-eco)' }}
          >
            <div className="absolute top-0 right-0 opacity-[0.03]">
              <Leaf size={140} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-5">
                <Brain size={18} className="text-[var(--color-eco)]" />
                <h3 className="font-display font-bold">Your AI Action Plan This Week</h3>
              </div>
              <div className="space-y-3 mb-5">
                {weeklyPlan.actions.map((action, i) => {
                  const IconMap = { bike: Bike, bus: Bus, moon: Moon, zap: Zap, check: CheckCircle2, clipboard: Target }
                  const ActionIcon = IconMap[action.icon] || CheckCircle2
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.5, ease }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-eco)]/30 transition-all duration-300"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-eco)]/10 flex items-center justify-center shrink-0">
                        <ActionIcon size={14} className="text-[var(--color-eco)]" />
                      </div>
                      <span className="text-sm font-medium text-[var(--color-text-secondary)] flex-1">{action.text}</span>
                      {action.savings > 0 && (
                        <span className="text-xs font-bold text-[var(--color-eco)] px-2 py-1 rounded-md bg-[var(--color-eco)]/8 shrink-0">
                          −{action.savings} kg
                        </span>
                      )}
                    </motion.div>
                  )
                })}
              </div>
              {weeklyPlan.totalPotential > 0 && (
                <div className="flex items-center gap-2 pt-4 border-t border-[var(--color-border)]">
                  <TrendingUp size={14} className="text-[var(--color-eco)]" />
                  <span className="text-sm font-semibold">
                    Total potential: <span className="text-[var(--color-eco)]">{weeklyPlan.totalPotential} kg CO₂</span> saved this week
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* -- Timeline Chart -- */}
        <motion.div
          ref={chartRef}
          initial={{ opacity: 0, y: 30 }}
          animate={chartInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
          className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8"
        >
          <h2 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--color-brand)]" />
            Integrated Impact Timeline
          </h2>
          <div className="h-[320px] sm:h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={entries}>
                <defs>
                  <linearGradient id="dWellness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-health)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-health)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-eco)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-eco)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  fontFamily="var(--font-body)"
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="wellness" name="Wellness"
                  stroke="var(--color-health)" strokeWidth={2.5} fill="url(#dWellness)"
                  animationDuration={1200}
                />
                <Area
                  type="monotone" dataKey="co2" name="CO2 Impact"
                  stroke="var(--color-eco)" strokeWidth={1.5} strokeDasharray="5 5" fill="url(#dCo2)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-xs font-medium text-[var(--color-text-muted)]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 rounded bg-[var(--color-health)]" /> Wellness
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 rounded bg-[var(--color-eco)] border-dashed" style={{ borderBottom: '1px dashed var(--color-eco)', height: 0 }} /> CO2
            </div>
          </div>
        </motion.div>

        {/* -- AI Insight + Quick Stats -- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="lg:col-span-2 space-y-5"
          >
            <h3 className="font-display font-bold flex items-center gap-2">
              <Brain size={18} className="text-[var(--color-brand)]" /> AI Observation
            </h3>
            <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8 relative overflow-hidden group hover:border-[var(--color-border-hover)] transition-colors duration-300">
              <div className="absolute top-0 right-0 opacity-5 group-hover:opacity-[0.08] transition-opacity duration-500">
                <Brain size={120} />
              </div>
              <p className="relative z-10 font-display text-xl sm:text-2xl font-medium leading-relaxed text-[var(--color-text)]/90 italic">
                &ldquo;{insight?.text || 'Start logging to receive AI-powered observations.'}&rdquo;
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg bg-[var(--color-brand)]/10 text-[var(--color-brand)] text-[11px] font-semibold uppercase tracking-wider border border-[var(--color-brand)]/20">
                  {insight?.type === 'balanced' ? 'Dual Impact' : insight?.type === 'health' ? 'Health Focus' : 'Climate Focus'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Health Causation', color: 'var(--color-health)', text: insight?.correlations?.health },
                { label: 'Climate Causation', color: 'var(--color-eco)', text: insight?.correlations?.planet },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease }}
                  whileHover={{ y: -2, transition: { duration: 0.25 } }}
                  className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] border-l-[3px] p-5 hover:border-[var(--color-border-hover)] transition-all duration-300"
                  style={{ borderLeftColor: item.color }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: item.color }}>{item.label}</p>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* -- Mission Preview -- */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="space-y-5"
          >
            <h3 className="font-display font-bold flex items-center gap-2">
              <Target size={18} className="text-[var(--color-accent)]" /> Active Mission
            </h3>
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.3 } }}
              className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 hover:border-[var(--color-border-hover)] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                  <Target size={18} />
                </div>
                <div>
                  <p className="font-display font-bold text-sm">Cycle 3x This Week</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">One habit. Two impacts.</p>
                </div>
              </div>
              <div className="flex gap-4 mb-5">
                <div className="flex-1 text-center">
                  <p className="font-display text-lg font-bold text-[var(--color-health)]">+18%</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] uppercase">Energy</p>
                </div>
                <div className="w-px bg-[var(--color-border)]" />
                <div className="flex-1 text-center">
                  <p className="font-display text-lg font-bold text-[var(--color-eco)]">-5.2 kg</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] uppercase">CO2</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/mission'}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold text-sm border border-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/20 transition-colors duration-300 focus-ring"
              >
                View Mission <ArrowUpRight size={14} />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
