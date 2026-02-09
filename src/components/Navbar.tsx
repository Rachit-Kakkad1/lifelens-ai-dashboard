import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, BarChart3, Lightbulb, SlidersHorizontal, Target, User } from "lucide-react";

const navItems = [
  { path: "/checkin", label: "Check In", icon: Activity },
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/insights", label: "Insights", icon: Lightbulb },
  { path: "/simulator", label: "Simulator", icon: SlidersHorizontal },
  { path: "/mission", label: "Mission", icon: Target },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50 rounded-none"
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-foreground font-semibold text-lg"
        >
          <Activity className="w-5 h-5 text-primary" />
          <span>LifeLens</span>
          <span className="text-xs text-primary font-medium ml-1">AI</span>
        </button>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-secondary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => navigate("/profile")}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${location.pathname === "/profile"
            ? "bg-primary text-primary-foreground border-primary glow-primary"
            : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
            }`}
        >
          <User className="w-5 h-5" />
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
