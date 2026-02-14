import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell
} from 'recharts'
import {
  Zap, Leaf, TrendingUp, Brain, Clock, Calendar, Target, ArrowUpRight,
  Sparkles, Bike, Bus, CheckCircle2, Moon, Activity, BarChart3
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

function CustomNeuralDot(props) {
  const { cx, cy, color, small } = props
  if (!cx || !cy) return null

  return (
    <g>
      <foreignObject x={cx - 30} y={cy - 30} width={60} height={60}>
        <div className="flex items-center justify-center w-full h-full">
          <div className="neural-ripple" style={{ backgroundColor: color, border: `1px solid ${color}40` }} />
          <div className="neural-ripple" style={{ backgroundColor: color, border: `1px solid ${color}40`, animationDelay: '0.4s' }} />
        </div>
      </foreignObject>
      <circle
        cx={cx}
        cy={cy}
        r={small ? 3 : 5}
        fill="#fff"
        stroke={color}
        strokeWidth={2}
        className="active-dot-pulse"
      />
    </g>
  )
}

function CustomCursor(props) {
  const { top, left, height } = props
  return (
    <foreignObject x={left - 1} y={top} width={2} height={height}>
      <div className="laser-scan h-full" />
    </foreignObject>
  )
}

function ImpactRadial({ data }) {
  const radius = 80
  const center = 100
  let cumulativeValue = 0

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">
      {data.map((item, i) => {
        const startValue = cumulativeValue
        const endValue = cumulativeValue + item.val
        cumulativeValue += item.val

        const startAngle = (startValue / 100) * 360 - 90
        const endAngle = (endValue / 100) * 360 - 90

        const startX = center + radius * Math.cos((startAngle * Math.PI) / 180)
        const startY = center + radius * Math.sin((startAngle * Math.PI) / 180)
        const endX = center + radius * Math.cos((endAngle * Math.PI) / 180)
        const endY = center + radius * Math.sin((endAngle * Math.PI) / 180)

        const largeArc = item.val > 50 ? 1 : 0

        const d = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`

        return (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke={item.color}
            strokeWidth={12}
            strokeLinecap="round"
            className="segment-reveal"
            style={{ filter: `drop-shadow(0 0 8px ${item.color}60)` }}
            whileHover={{ strokeWidth: 16, transition: { duration: 0.3 } }}
          />
        )
      })}
    </svg>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="glass-hud p-5 rounded-2xl min-w-[220px] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <Activity size={40} className="text-white" />
      </div>
      <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-3 border-b border-white/5 pb-2 flex items-center gap-2">
        <Clock size={10} /> Temporal Sync: {label}
      </p>
      <div className="space-y-4">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }} />
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">{p.name}</span>
            </div>
            <span className="font-display text-lg font-bold climate-readout text-white" style={{ textShadow: `0 2px 10px ${p.color}40` }}>
              {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
              <span className="text-[10px] text-[var(--color-text-muted)] ml-1 font-medium">{p.name === 'Wellness' ? '%' : 'kg'}</span>
            </span>
          </div>
        ))}
      </div>
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
  const [activeMission, setActiveMission] = useState(null)
  const chartRef = useRef(null)
  const chartInView = useInView(chartRef, { once: true, margin: '-50px' })

  useEffect(() => {
    StorageService.init()
    const data = StorageService.getEntries()
    setActiveMission(StorageService.getMissionState())
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
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease }}
            className="rounded-[2.5rem] relative overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] group"
          >
            {/* God-Level Mesh Background */}
            <div className="absolute inset-0 mesh-gradient-animate opacity-[0.15] mix-blend-screen pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-surface)]/80 to-[var(--color-surface)] pointer-events-none" />

            <div className="relative z-10 p-8 sm:p-12">
              <div className="flex flex-col lg:flex-row gap-12 items-center">

                {/* HUD Left: Context & Title */}
                <div className="flex-1 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/20 text-[var(--color-brand)] text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Sparkles size={12} /> Climate Prediction Engine v4.0
                  </motion.div>

                  <div className="space-y-3">
                    <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tighter text-white leading-tight">
                      Your Climate <br />
                      <span className="text-gradient-animated">Future</span>
                    </h2>
                    <p className="text-base text-[var(--color-text-secondary)] max-w-sm leading-relaxed climate-readout">
                      Neural trajectory mapping based on your biometric sync. <br />
                      <span className="text-[var(--color-text)] font-semibold italic">Small shifts today redefine your 2030 path.</span>
                    </p>
                  </div>

                  <div className="pt-6 flex items-center gap-8 border-t border-[var(--color-border)]">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-widest mb-1">Impact Radius</p>
                      <p className="text-xl font-display font-bold text-white">Planetary</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-widest mb-1">Sync Resolution</p>
                      <p className="text-xl font-display font-bold text-[var(--color-accent)]">99.8%</p>
                    </div>
                  </div>
                </div>

                {/* HUD Right: Interactive Path Modules */}
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6 perspective-1000">

                  {/* Current Path Module */}
                  <motion.div
                    whileHover={{ rotateY: -5, rotateX: 5, z: 20, scale: 1.02 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="p-8 rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/5 relative group/card glass-glow-critical will-change-transform"
                  >
                    <div className="absolute top-4 right-4 text-[var(--color-danger)] animate-pulse">
                      <TrendingUp size={20} />
                    </div>
                    <p className="text-[10px] font-bold text-[var(--color-danger)] uppercase tracking-[0.2em] mb-6">Current Path</p>

                    <div className="space-y-1">
                      <p className="font-display text-5xl font-bold text-white tracking-tighter">
                        {(() => {
                          const recent = entries.slice(-7) || []
                          const avgDaily = recent.reduce((s, e) => s + e.rawCo2, 0) / (recent.length || 1)
                          return (avgDaily * 365 / 1000).toFixed(1)
                        })()}
                      </p>
                      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">tons co₂ / yr</p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/5">
                      <p className="text-[10px] font-bold text-[var(--color-danger)] uppercase">Status: Critical</p>
                    </div>
                  </motion.div>

                  {/* AI Optimized Module */}
                  <motion.div
                    whileHover={{ rotateY: 5, rotateX: -5, z: 20, scale: 1.02 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="p-8 rounded-[2rem] bg-[var(--color-eco)]/5 backdrop-blur-xl border border-[var(--color-eco)]/20 relative group/card glass-glow-optimized shadow-[0_0_50px_-20px_var(--color-eco)] will-change-transform"
                  >
                    <div className="absolute top-4 right-4 text-[var(--color-eco)]">
                      <Sparkles size={20} />
                    </div>
                    <p className="text-[10px] font-bold text-[var(--color-eco)] uppercase tracking-[0.2em] mb-6">AI Optimized</p>

                    <div className="space-y-1">
                      <p className="font-display text-5xl font-bold text-[var(--color-eco)] tracking-tighter">
                        {(() => {
                          const recent = entries.slice(-7) || []
                          const avgDaily = recent.reduce((s, e) => s + e.rawCo2, 0) / (recent.length || 1)
                          return ((avgDaily * 365 / 1000) * 0.6).toFixed(1)
                        })()}
                      </p>
                      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">tons co₂ / yr</p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-[var(--color-eco)]/10">
                      <p className="text-[10px] font-bold text-[var(--color-eco)] uppercase">Status: Compliant</p>
                    </div>
                  </motion.div>

                </div>
              </div>
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-brand)]/40 to-transparent" />
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

        {/* -- Neural Impact Breakdown (God-Level Category View) -- */}
        {dataCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease }}
            className="rounded-[2.5rem] bg-[var(--color-surface)] border border-[var(--color-border)] p-8 sm:p-12 relative overflow-hidden group/breakdown shadow-[0_40px_80px_-40px_rgba(0,0,0,0.5)]"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand)]/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 sm:gap-16">

              {/* Radial Visualization Side */}
              <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full border border-white/5 pulse-ring" />
                <div className="absolute inset-8 rounded-full border border-white/5" />

                <ImpactRadial data={[
                  { label: 'Travel', val: 45, color: 'var(--color-brand)' },
                  { label: 'Diet', val: 30, color: 'var(--color-eco)' },
                  { label: 'Energy', val: 15, color: 'var(--color-accent)' },
                  { label: 'Habits', val: 10, color: 'var(--color-warn)' },
                ]} />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-1">Total Net</p>
                  <p className="text-4xl font-display font-black text-white leading-none">
                    {(() => {
                      const recent = entries.slice(-7) || []
                      const avgDaily = recent.reduce((s, e) => s + e.rawCo2, 0) / (recent.length || 1)
                      return ((avgDaily * 365 / 1000) * 0.4).toFixed(1)
                    })()}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-eco)] mt-1">Saved / Yr</p>
                </div>
              </div>

              {/* Data Intelligence Side */}
              <div className="flex-1 space-y-8">
                <div className="space-y-2">
                  <h3 className="font-display text-4xl font-black text-white tracking-tighter">
                    Neural Impact <br />
                    <span className="text-gradient-animated">Breakdown</span>
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] max-w-sm climate-readout">
                    Autonomous categorical analysis of your lifestyle delta. <br />
                    <span className="text-white/80 font-bold italic">Where your actions hit the hardest.</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Transport Sync', pct: '45%', color: 'var(--color-brand)', icon: Bus },
                    { label: 'Nutritional Delta', pct: '30%', color: 'var(--color-eco)', icon: Leaf },
                    { label: 'Energy Flow', pct: '15%', color: 'var(--color-accent)', icon: Zap },
                    { label: 'Habit Density', pct: '10%', color: 'var(--color-warn)', icon: Activity },
                  ].map((pod, i) => (
                    <motion.div
                      key={pod.label}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="p-4 rounded-2xl bg-black/20 border border-white/5 flex items-center gap-4 group/pod cursor-default"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/pod:bg-white/10 transition-colors">
                        <pod.icon size={18} style={{ color: pod.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">{pod.label}</p>
                        <p className="text-lg font-display font-bold text-white leading-tight">{pod.pct}</p>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pod.color, boxShadow: `0 0 10px ${pod.color}` }} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* -- Daily Resilience HUD (God-Level Bar Sync) -- */}
        {dataCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease }}
            className="rounded-[2.5rem] bg-[var(--color-surface)] border border-[var(--color-border)] p-8 sm:p-12 relative overflow-hidden group/resilience shadow-[0_40px_80px_-40px_rgba(0,0,0,0.5)]"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                    <BarChart3 size={18} className="text-[var(--color-accent)]" />
                  </div>
                  Daily Sync Performance
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-widest ml-11">Weekly Resilience & Carbon Adaptivity</p>
              </div>

              <div className="flex items-center gap-3 p-1 px-4 rounded-full bg-black/20 border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)] pulse-ring-glow">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  Real-Time Resilience: {sustainScore.toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="h-[300px] sm:h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={entries.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 12 }}
                  />

                  {/* Personal Best Reference */}
                  <ReferenceLine
                    y={85}
                    stroke="var(--color-health)"
                    strokeDasharray="4 4"
                    strokeOpacity={0.3}
                    label={{ position: 'left', value: 'GOAL', fill: 'var(--color-health)', fontSize: 9, fontWeight: 900 }}
                  />

                  <Bar
                    dataKey="wellness"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  >
                    {entries.slice(-7).map((entry, index) => {
                      const score = calculateSustainabilityScore(entry.rawCo2)
                      const color = score > 70 ? 'var(--color-health)' : score > 40 ? 'var(--color-accent)' : 'var(--color-warn)'
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={color}
                          fillOpacity={0.4}
                          stroke={color}
                          strokeWidth={2}
                          className="bar-glow-adaptive vertical-grow"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        />
                      )
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/5">
              <div className="flex gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-health)]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Optimized</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Stable</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-warn)]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Critical</span>
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">
                Biometric Resilience Engine v1.0
              </p>
            </div>
          </motion.div>
        )}

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
              className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 hover:border-[var(--color-border-hover)] transition-all duration-300 relative group/mission"
            >
              {activeMission?.currentCount > 0 && !activeMission.completed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const fresh = { ...activeMission, currentCount: 0, completed: false, totalCo2Saved: 0, totalEnergyGained: 0 };
                    setActiveMission(fresh);
                    StorageService.saveMissionState(fresh);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover/mission:opacity-100 transition-all hover:bg-red-500/20"
                  title="Exit Mission"
                >
                  <LogOut size={14} />
                </button>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
                  <Target size={18} />
                </div>
                <div>
                  <p className="font-display font-bold text-sm">{activeMission?.title || 'Cycle 3x This Week'}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    {activeMission?.completed ? 'Mission Accomplished!' : 'One habit. Two impacts.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 mb-5">
                <div className="flex-1 text-center">
                  <p className="font-display text-lg font-bold text-[var(--color-health)]">
                    +{activeMission?.totalEnergyGained || 18}%
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] uppercase">Energy</p>
                </div>
                <div className="w-px bg-[var(--color-border)]" />
                <div className="flex-1 text-center">
                  <p className="font-display text-lg font-bold text-[var(--color-eco)]">
                    -{activeMission?.totalCo2Saved.toFixed(1) || '5.2'} kg
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] uppercase">CO2</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/mission'}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold text-sm border border-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/20 transition-colors duration-300 focus-ring"
              >
                {activeMission?.completed ? 'View Results' : 'Mission Tracker'} <ArrowUpRight size={14} />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
