import { motion } from "framer-motion";
import { BarChart, Bar, ResponsiveContainer, XAxis } from "recharts";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import MiniSparkline from "@/components/MiniSparkline";
import { insightCards, sleepCorrelation } from "@/data/mockData";

const InsightCard = ({ card, index }: { card: typeof insightCards[0]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 + index * 0.08, ease: [0.22, 0.8, 0.28, 1] }}
    whileHover={{ y: -2 }}
    className="glass-card p-5 flex flex-col gap-3"
  >
    <div className="flex items-start justify-between">
      <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
        {card.confidence}%
      </span>
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
    <MiniSparkline
      data={card.sparkline}
      color={card.category === "health" ? "hsl(174, 100%, 45%)" : "hsl(137, 55%, 60%)"}
    />
    <div className="w-full bg-secondary rounded-full h-1">
      <div
        className="confidence-bar"
        style={{ width: `${card.confidence}%` }}
      />
    </div>
  </motion.div>
);

const Insights = () => (
  <div className="min-h-screen gradient-bg">
    <Navbar />
    <PageTransition>
      <main className="pt-20 pb-10 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Cinematic Wellness
          </h1>
          <p className="text-sm text-muted-foreground">
            Analyzing your daily lifestyle to uncover actionable patterns.
          </p>
        </motion.div>

        {/* Insight Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {insightCards.map((card, i) => (
            <InsightCard key={card.id} card={card} index={i} />
          ))}
        </div>

        {/* Sleep Efficiency Correlation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Sleep Efficiency Correlation
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Analyzing your last 30 days reveals a significant pattern: on 
                days following sleep durations of 8+ hr, learning efficiency 
                increases by an average of 23%.
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sleepCorrelation}>
              <XAxis
                dataKey="hour"
                stroke="hsl(224 20% 78%)"
                fontSize={11}
                tickLine={false}
              />
              <Bar
                dataKey="efficiency"
                fill="hsl(261, 100%, 65%)"
                radius={[4, 4, 0, 0]}
                opacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-4">
            <button className="btn-glow px-4 py-2 rounded-lg text-sm text-primary-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary">
              Explore Analysis
            </button>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              View Data Source →
            </button>
          </div>
        </motion.div>
      </main>
    </PageTransition>
  </div>
);

export default Insights;
