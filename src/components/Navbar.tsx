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
      className="fixed top-4 md:top-6 left-0 right-0 mx-auto z-50 w-fit max-w-[95vw] glass-card border border-white/20 rounded-full shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-2xl px-3 md:px-6 py-2 flex items-center justify-center gap-2 md:gap-6 transition-all duration-300"
    >
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-foreground font-semibold text-lg hover:opacity-80 transition-opacity"
      >
        <span className="tracking-tight text-sm md:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/90 whitespace-nowrap">LifeLens AI</span>
      </button>

      <div className="flex items-center gap-0.5 md:gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative px-2.5 md:px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full bg-secondary/80 backdrop-blur-md border border-white/5 shadow-inner"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-2 z-10">
                <item.icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => navigate("/profile")}
        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${location.pathname === "/profile"
          ? "bg-primary text-primary-foreground border-primary glow-primary"
          : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
          }`}
      >
        <User className="w-5 h-5" />
      </button>
    </motion.nav>
  );
};

export default Navbar;
