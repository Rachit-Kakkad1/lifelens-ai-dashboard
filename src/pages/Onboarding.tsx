import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

function TestLogin() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email: "kakkadrachit1@gmail.com",
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Magic link sent! Check your email.");
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="text-sm font-medium text-muted-foreground hover:text-primary hover:opacity-100 transition-all mt-6 underline underline-offset-4"
    >
      Continue with Email
    </button>
  );
}


const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-accent/8 rounded-full blur-[100px] animate-pulse-glow" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 0.8, 0.28, 1] }}
        className="glass-card p-12 max-w-lg w-full text-center relative glow-primary"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Sparkles className="w-10 h-10 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Cinematic Wellness
            <br />
            Intelligence
          </h1>
          <p className="text-muted-foreground text-base mb-8 leading-relaxed">
            Discover how your daily choices shape your health and the planet.
            Backed by real data, powered by AI insight.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/dashboard")}
          className="btn-glow px-8 py-3.5 rounded-xl text-primary-foreground font-semibold text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          Visualize Your Next 90 Days →
        </motion.button>

        <div className="mt-8">
          <TestLogin />
        </div>

      </motion.div>
    </div>
  );
};

export default Onboarding;
