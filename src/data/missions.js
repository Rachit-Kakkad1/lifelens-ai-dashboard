import { Bike, Leaf, Zap, Moon, Coffee, Brain, Utensils, Droplets } from 'lucide-react'

export const MISSIONS = [
    {
        id: 'cycle-commute',
        title: 'Low-Carbon Commute',
        description: 'Replace 3 car trips with cycling or walking this week.',
        category: 'eco',
        targetCount: 3,
        energyBoost: '+18%',
        co2Reduction: '-5.2 kg',
        icon: Bike,
        color: 'var(--color-brand)',
        theme: 'health',
        missionData: [
            { day: 'Mon', baseline: 65, projected: 68 },
            { day: 'Tue', baseline: 62, projected: 70 },
            { day: 'Wed', baseline: 68, projected: 75 },
            { day: 'Thu', baseline: 64, projected: 78 },
            { day: 'Fri', baseline: 70, projected: 82 },
            { day: 'Sat', baseline: 66, projected: 80 },
            { day: 'Sun', baseline: 72, projected: 85 }
        ]
    },
    {
        id: 'plant-based',
        title: 'Plant-Based Power',
        description: 'Switch to plant-based meals for 4 days this week.',
        category: 'eco',
        targetCount: 4,
        energyBoost: '+12%',
        co2Reduction: '-8.4 kg',
        icon: Leaf,
        color: 'var(--color-eco)',
        theme: 'eco',
        missionData: [
            { day: 'Mon', baseline: 60, projected: 64 },
            { day: 'Tue', baseline: 63, projected: 68 },
            { day: 'Wed', baseline: 61, projected: 70 },
            { day: 'Thu', baseline: 65, projected: 74 },
            { day: 'Fri', baseline: 62, projected: 72 },
            { day: 'Sat', baseline: 68, projected: 78 },
            { day: 'Sun', baseline: 66, projected: 80 }
        ]
    },
    {
        id: 'sleep-hygiene',
        title: 'Deep Sleep Protocol',
        description: 'Get 8 hours of sleep for 5 nights this week.',
        category: 'health',
        targetCount: 5,
        energyBoost: '+25%',
        co2Reduction: '-1.2 kg',
        icon: Moon,
        color: 'var(--color-accent)',
        theme: 'health',
        missionData: [
            { day: 'Mon', baseline: 50, projected: 65 },
            { day: 'Tue', baseline: 55, projected: 70 },
            { day: 'Wed', baseline: 52, projected: 75 },
            { day: 'Thu', baseline: 58, projected: 82 },
            { day: 'Fri', baseline: 54, projected: 80 },
            { day: 'Sat', baseline: 60, projected: 88 },
            { day: 'Sun', baseline: 62, projected: 90 }
        ]
    },
    {
        id: 'caffeine-cut',
        title: 'Caffeine Detox',
        description: 'No caffeine after 2 PM for 6 days.',
        category: 'health',
        targetCount: 6,
        energyBoost: '+15%',
        co2Reduction: '0 kg',
        icon: Coffee,
        color: 'var(--color-warn)',
        theme: 'health',
        missionData: [
            { day: 'Mon', baseline: 70, projected: 75 },
            { day: 'Tue', baseline: 68, projected: 76 },
            { day: 'Wed', baseline: 72, projected: 80 },
            { day: 'Thu', baseline: 65, projected: 78 },
            { day: 'Fri', baseline: 74, projected: 85 },
            { day: 'Sat', baseline: 70, projected: 82 },
            { day: 'Sun', baseline: 75, projected: 88 }
        ]
    },
    {
        id: 'mindful-minutes',
        title: 'Mindful Minutes',
        description: 'Meditate for 10 minutes every day this week.',
        category: 'health',
        targetCount: 7,
        energyBoost: '+20%',
        co2Reduction: '0 kg',
        icon: Brain,
        color: 'var(--color-brand)',
        theme: 'health',
        missionData: [
            { day: 'Mon', baseline: 40, projected: 55 },
            { day: 'Tue', baseline: 45, projected: 60 },
            { day: 'Wed', baseline: 42, projected: 65 },
            { day: 'Thu', baseline: 48, projected: 72 },
            { day: 'Fri', baseline: 44, projected: 70 },
            { day: 'Sat', baseline: 50, projected: 78 },
            { day: 'Sun', baseline: 52, projected: 82 }
        ]
    },
    {
        id: 'local-harvest',
        title: 'Local Harvest',
        description: 'Eat 100% locally sourced meals for 3 days.',
        category: 'eco',
        targetCount: 3,
        energyBoost: '+8%',
        co2Reduction: '-12.5 kg',
        icon: Utensils,
        color: 'var(--color-eco)',
        theme: 'eco',
        missionData: [
            { day: 'Mon', baseline: 65, projected: 68 },
            { day: 'Tue', baseline: 62, projected: 70 },
            { day: 'Wed', baseline: 68, projected: 75 },
            { day: 'Thu', baseline: 64, projected: 78 },
            { day: 'Fri', baseline: 70, projected: 82 },
            { day: 'Sat', baseline: 66, projected: 80 },
            { day: 'Sun', baseline: 72, projected: 85 }
        ]
    },
    {
        id: 'hydration-sync',
        title: 'Hydration Sync',
        description: 'Drink 3L of water daily for the entire week.',
        category: 'health',
        targetCount: 7,
        energyBoost: '+10%',
        co2Reduction: '0 kg',
        icon: Droplets,
        color: 'var(--color-accent)',
        theme: 'health',
        missionData: [
            { day: 'Mon', baseline: 60, projected: 65 },
            { day: 'Tue', baseline: 62, projected: 68 },
            { day: 'Wed', baseline: 61, projected: 70 },
            { day: 'Thu', baseline: 65, projected: 74 },
            { day: 'Fri', baseline: 63, projected: 72 },
            { day: 'Sat', baseline: 68, projected: 78 },
            { day: 'Sun', baseline: 67, projected: 80 }
        ]
    }
]
