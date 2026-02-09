import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { TransportMode } from "@/types";
import { StorageService } from "@/services/storage";
import { calculateWellnessScore } from "@/logic/wellness";
import { calculateDailyCO2 } from "@/logic/co2";
import { updateMissionProgress } from "@/logic/mission";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Brain, Leaf, Bike, Car, Footprints, Bus } from "lucide-react";

// Form Schema
const formSchema = z.object({
    sleep: z.number().min(0).max(10),
    energy: z.number().min(0).max(10),
    mood: z.number().min(0).max(10),
    transport: z.enum(["walk", "cycle", "public", "car"] as const),
});

type FormValues = z.infer<typeof formSchema>;

const CheckIn = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sleep: 7,
            energy: 7,
            mood: 7,
            transport: "public",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);

        try {
            // 1. Calculate values
            const wellness = calculateWellnessScore(values.sleep, values.energy, values.mood);
            const co2 = calculateDailyCO2(values.transport);

            const now = new Date();

            const entry = {
                id: crypto.randomUUID(),
                date: now.toISOString().split('T')[0],
                timestamp: now.getTime(),
                sleep: values.sleep,
                energy: values.energy,
                mood: values.mood,
                transport: values.transport,
                wellnessScore: wellness,
                co2Emitted: co2
            };

            // 2. Save Entry
            StorageService.saveEntry(entry);

            // 3. Update Mission
            const currentMission = StorageService.getMissionState();
            const updatedMission = updateMissionProgress(currentMission, values.transport, values.energy);
            StorageService.saveMissionState(updatedMission);

            toast.success("Check-in saved!", {
                description: `Wellness: ${wellness} | CO₂: ${co2}kg`
            });

            // 4. Navigate to Dashboard
            setTimeout(() => navigate("/dashboard"), 500);

        } catch (error) {
            console.error(error);
            toast.error("Failed to save check-in");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen gradient-bg">
            <Navbar />
            <main className="pt-24 pb-10 px-6 max-w-lg mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="glass-card border-none">
                        <CardHeader>
                            <CardTitle className="text-2xl">Daily Check-In</CardTitle>
                            <CardDescription>Target your wellness and impact goals.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                                    {/* Sleep */}
                                    <FormField
                                        control={form.control}
                                        name="sleep"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Brain className="w-4 h-4 text-purple-400" />
                                                    Sleep Quality ({field.value})
                                                </FormLabel>
                                                <FormControl>
                                                    <Slider
                                                        min={0}
                                                        max={10}
                                                        step={1}
                                                        defaultValue={[field.value]}
                                                        onValueChange={(vals) => field.onChange(vals[0])}
                                                        className="py-4"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Energy */}
                                    <FormField
                                        control={form.control}
                                        name="energy"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <span className="text-yellow-400">⚡</span>
                                                    Energy Level ({field.value})
                                                </FormLabel>
                                                <FormControl>
                                                    <Slider
                                                        min={0}
                                                        max={10}
                                                        step={1}
                                                        defaultValue={[field.value]}
                                                        onValueChange={(vals) => field.onChange(vals[0])}
                                                        className="py-4"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Mood */}
                                    <FormField
                                        control={form.control}
                                        name="mood"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <span className="text-pink-400">😊</span>
                                                    Mood Level ({field.value})
                                                </FormLabel>
                                                <FormControl>
                                                    <Slider
                                                        min={0}
                                                        max={10}
                                                        step={1}
                                                        defaultValue={[field.value]}
                                                        onValueChange={(vals) => field.onChange(vals[0])}
                                                        className="py-4"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Transport */}
                                    <FormField
                                        control={form.control}
                                        name="transport"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Leaf className="w-4 h-4 text-green-400" />
                                                    Main Transport Today
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select transport" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="walk">
                                                            <div className="flex items-center gap-2">
                                                                <Footprints className="w-4 h-4" /> Walk (0kg CO₂)
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="cycle">
                                                            <div className="flex items-center gap-2">
                                                                <Bike className="w-4 h-4" /> Cycle (0kg CO₂)
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="public">
                                                            <div className="flex items-center gap-2">
                                                                <Bus className="w-4 h-4" /> Public Transport (0.5kg CO₂)
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="car">
                                                            <div className="flex items-center gap-2">
                                                                <Car className="w-4 h-4" /> Car (2.5kg CO₂)
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? "Saving..." : "Save Daily Entry"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
};

export default CheckIn;
