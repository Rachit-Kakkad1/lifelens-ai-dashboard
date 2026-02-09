import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    User, Mail, Shield, Trash2,
    LogOut, Award, Star, Zap, Leaf,
    ChevronRight, Save, Edit2, SlidersHorizontal, Trophy
} from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { StorageService } from "@/services/storage";
import { UserProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Profile = () => {
    const [profile, setProfile] = useState<UserProfile>({ name: "User", onboardingCompleted: false });
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [stats, setStats] = useState({
        totalCheckins: 0,
        avgWellness: 0,
        totalCo2Saved: 0,
        streak: 0
    });

    useEffect(() => {
        StorageService.init();
        const loadedProfile = StorageService.getUserProfile();
        const entries = StorageService.getEntries();
        const mission = StorageService.getMissionState();

        setProfile(loadedProfile);
        setEditName(loadedProfile.name);

        if (entries.length > 0) {
            const avgWellness = Math.round(entries.reduce((sum, e) => sum + e.wellnessScore, 0) / entries.length);
            setStats({
                totalCheckins: entries.length,
                avgWellness: avgWellness,
                totalCo2Saved: parseFloat(mission.totalCo2Saved.toFixed(1)),
                streak: Math.min(entries.length, 3)
            });
        }
    }, []);

    const handleSave = () => {
        const updated = { ...profile, name: editName };
        StorageService.saveUserProfile(updated);
        setProfile(updated);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
    };

    const handleReset = () => {
        if (confirm("Are you sure? This will delete all your daily entries and reset progress.")) {
            StorageService.resetData();
            window.location.reload();
        }
    };

    const badges = [
        { icon: Zap, label: "Energy Pioneer", color: "text-accent", active: stats.avgWellness > 70 },
        { icon: Leaf, label: "Eco Guardian", color: "text-eco", active: stats.totalCo2Saved > 5 },
        { icon: Star, label: "Consistency King", color: "text-primary", active: stats.totalCheckins > 3 },
        { icon: Trophy, label: "Early Adopter", color: "text-orange-400", active: true },
    ];

    return (
        <div className="min-h-screen gradient-bg">
            <Navbar />
            <PageTransition>
                <main className="pt-20 pb-10 px-6 max-w-4xl mx-auto space-y-8">

                    <div className="flex flex-col md:flex-row items-center gap-8 glass-card p-10">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-3xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-5xl font-bold text-primary">
                                {profile.name[0]?.toUpperCase() || "U"}
                            </div>
                            <button onClick={() => setIsEditing(true)} className="absolute -bottom-2 -right-2 p-2 bg-secondary rounded-xl border border-border hover:bg-muted transition-colors">
                                <Edit2 className="w-4 h-4 text-foreground" />
                            </button>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="text-2xl font-bold h-10 w-48"
                                        />
                                        <Button size="sm" onClick={handleSave}><Save className="w-4 h-4" /></Button>
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-4xl font-black text-foreground">{profile.name}</h1>
                                        <button onClick={() => setIsEditing(true)}><Edit2 className="w-5 h-5 text-muted-foreground" /></button>
                                    </>
                                )}
                            </div>
                            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                                <Shield className="w-4 h-4 text-primary" /> Behavioral Intelligence Rank: <span className="text-primary font-bold">Level 1 Novice</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Check-ins", value: stats.totalCheckins, sub: "Total days" },
                            { label: "Avg Wellness", value: `${stats.avgWellness}%`, sub: "Last 7 days" },
                            { label: "CO₂ Saved", value: `${stats.totalCo2Saved}kg`, sub: "Lifetime" },
                            { label: "Streak", value: stats.streak, sub: "Day streak" },
                        ].map((s, i) => (
                            <div key={i} className="glass-card p-6 text-center">
                                <p className="text-3xl font-black text-foreground">{s.value}</p>
                                <p className="text-xs font-bold text-primary uppercase tracking-tighter mt-1">{s.label}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        <div className="space-y-4">
                            <h3 className="font-bold text-foreground px-2 flex items-center gap-2">
                                <Award className="w-5 h-5 text-primary" /> Impact Milestones
                            </h3>
                            <div className="glass-card p-6 grid grid-cols-2 gap-4">
                                {badges.map((b, i) => (
                                    <div
                                        key={i}
                                        className={`flex flex-col items-center p-4 rounded-xl border transition-all ${b.active ? "bg-background/40 border-primary/20" : "bg-background/10 border-transparent opacity-40 grayscale"
                                            }`}
                                    >
                                        <b.icon className={`w-10 h-10 mb-2 ${b.active ? b.color : "text-muted-foreground"}`} />
                                        <span className="text-[10px] font-black uppercase text-center leading-tight">{b.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-foreground px-2 flex items-center gap-2">
                                <SlidersHorizontal className="w-5 h-5 text-primary" /> Account Settings
                            </h3>
                            <div className="glass-card p-2">
                                <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-muted-foreground" />
                                        <div className="text-left">
                                            <p className="text-sm font-bold">Privacy Settings</p>
                                            <p className="text-xs text-muted-foreground">Manage your local data storage</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 rounded-xl transition-colors group text-red-500"
                                >
                                    <div className="flex items-center gap-3">
                                        <Trash2 className="w-5 h-5" />
                                        <div className="text-left">
                                            <p className="text-sm font-bold">Reset All Data</p>
                                            <p className="text-xs text-red-400/70">Wipe all check-ins and progress</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <LogOut className="w-5 h-5 text-muted-foreground" />
                                        <div className="text-left">
                                            <p className="text-sm font-bold">Sign Out</p>
                                            <p className="text-xs text-muted-foreground">Return to onboarding</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                    </div>

                </main>
            </PageTransition>
        </div>
    );
};

export default Profile;
