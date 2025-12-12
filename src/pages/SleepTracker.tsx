import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Moon, Plus, Target, Clock, Sunrise, Sunset, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, differenceInMinutes, parse } from 'date-fns';

import { DashboardCard } from '@/components/DashboardCard';
import { useWellnessData } from '@/hooks/useWellnessData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SleepLog {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number; // in minutes
  quality: 'poor' | 'fair' | 'good' | 'excellent';
}

const STORAGE_KEY = 'vitaltrack_sleep_logs';
const SLEEP_GOAL_KEY = 'vitaltrack_sleep_goal';

export default function SleepTracker() {
  const navigate = useNavigate();
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [bedtime, setBedtime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [quality, setQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');

  // Load sleep logs from localStorage
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [sleepGoal, setSleepGoal] = useState(() => {
    const saved = localStorage.getItem(SLEEP_GOAL_KEY);
    return saved ? parseInt(saved) : 480; // 8 hours default
  });

  const { addPoints } = useWellnessData();

  const saveSleepLogs = (logs: SleepLog[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    setSleepLogs(logs);
  };

  const calculateDuration = (bed: string, wake: string): number => {
    const bedDate = parse(bed, 'HH:mm', new Date());
    let wakeDate = parse(wake, 'HH:mm', new Date());
    
    // If wake time is earlier than bedtime, assume next day
    if (wakeDate <= bedDate) {
      wakeDate = new Date(wakeDate.getTime() + 24 * 60 * 60 * 1000);
    }
    
    return differenceInMinutes(wakeDate, bedDate);
  };

  const handleLogSleep = () => {
    const duration = calculateDuration(bedtime, wakeTime);
    
    if (duration < 0 || duration > 1440) {
      toast.error('Invalid sleep duration');
      return;
    }

    const newLog: SleepLog = {
      id: Date.now().toString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      bedtime,
      wakeTime,
      duration,
      quality,
    };

    saveSleepLogs([...sleepLogs, newLog]);
    addPoints(15);
    toast.success(`Logged ${Math.floor(duration / 60)}h ${duration % 60}m of sleep! 🌙`, {
      description: '+15 points earned',
    });
    setShowLogDialog(false);
  };

  const handleUpdateGoal = (hours: number) => {
    const minutes = hours * 60;
    localStorage.setItem(SLEEP_GOAL_KEY, minutes.toString());
    setSleepGoal(minutes);
    setShowGoalDialog(false);
    toast.success('Sleep goal updated!');
  };

  // Get today's sleep
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaySleep = sleepLogs.filter(log => log.date === today);
  const todayDuration = todaySleep.reduce((sum, log) => sum + log.duration, 0);

  // Calculate week data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = sleepLogs.filter(log => log.date === dateStr);
    const total = dayLogs.reduce((sum, log) => sum + log.duration, 0);
    return {
      day: format(date, 'EEE'),
      duration: total,
      isToday: i === 6,
    };
  });

  const maxDuration = Math.max(...weekData.map(d => d.duration), sleepGoal);
  const avgDuration = Math.round(weekData.reduce((s, d) => s + d.duration, 0) / 7);

  const qualityColors = {
    poor: 'bg-destructive/20 text-destructive border-destructive/30',
    fair: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
    good: 'bg-primary/20 text-primary border-primary/30',
    excellent: 'bg-accent/20 text-accent border-accent/30',
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50 pt-4 sm:pt-6 pb-3 sm:pb-4 px-4 sm:px-5 md:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-primary truncate flex items-center gap-2">
              <Moon className="w-5 h-5 sm:w-6 sm:h-6" />
              Sleep Tracker
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Rest well, live well</p>
          </div>
          <button
            onClick={() => setShowGoalDialog(true)}
            className="p-2 rounded-xl hover:bg-muted transition-colors flex-shrink-0"
          >
            <Target className="w-5 h-5 text-primary" />
          </button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-4">

        {/* Sleep Summary Card */}
        <div className="px-4 sm:px-5 md:px-8 mb-4">
          <DashboardCard className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Circular Progress */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-indigo-500/20"
                  />
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    className="text-indigo-500"
                    initial={{ strokeDasharray: "0 220" }}
                    animate={{
                      strokeDasharray: `${Math.min((todayDuration / sleepGoal) * 220, 220)} 220`
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                </div>
              </div>
              
              {/* Summary Text */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm text-muted-foreground mb-1">Last Night's Sleep</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-indigo-500">
                    {Math.floor(todayDuration / 60)}h {todayDuration % 60}m
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {todayDuration >= sleepGoal 
                    ? "🎉 Goal reached!" 
                    : `${Math.floor((sleepGoal - todayDuration) / 60)}h ${(sleepGoal - todayDuration) % 60}m to goal`
                  }
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Log Sleep Button */}
        <div className="px-4 sm:px-5 md:px-8 mb-4 sm:mb-6">
          <Button
            onClick={() => setShowLogDialog(true)}
            className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl text-base font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Log Sleep
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="px-4 sm:px-5 md:px-8 mb-4 sm:mb-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <DashboardCard className="p-3 sm:p-4 text-center">
              <Sunset className="w-5 h-5 mx-auto mb-1 text-orange-500" />
              <p className="text-xs text-muted-foreground">Avg Bedtime</p>
              <p className="text-sm sm:text-base font-bold">10:30 PM</p>
            </DashboardCard>
            <DashboardCard className="p-3 sm:p-4 text-center">
              <Sunrise className="w-5 h-5 mx-auto mb-1 text-amber-500" />
              <p className="text-xs text-muted-foreground">Avg Wake</p>
              <p className="text-sm sm:text-base font-bold">6:30 AM</p>
            </DashboardCard>
            <DashboardCard className="p-3 sm:p-4 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-accent" />
              <p className="text-xs text-muted-foreground">Avg Sleep</p>
              <p className="text-sm sm:text-base font-bold">{Math.floor(avgDuration / 60)}h {avgDuration % 60}m</p>
            </DashboardCard>
          </div>
        </div>

        {/* Week Chart */}
        <DashboardCard className="mx-4 sm:mx-5 md:mx-8" delay={0.2}>
          <h2 className="text-base sm:text-lg font-semibold mb-4">Last 7 Days</h2>
          <div className="flex items-end justify-between h-24 sm:h-32 gap-1">
            {weekData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                <div className="w-full flex flex-col items-center justify-end h-16 sm:h-24">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.duration / maxDuration) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className={`w-full rounded-t-lg ${
                      day.isToday ? 'bg-gradient-to-t from-indigo-500 to-purple-500' : 'bg-indigo-500/40'
                    }`}
                    style={{ minHeight: day.duration > 0 ? '8px' : '0' }}
                  />
                </div>
                <span className={`text-[10px] sm:text-xs ${day.isToday ? 'font-bold text-indigo-500' : 'text-muted-foreground'}`}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[10px] sm:text-xs text-muted-foreground">
            <span>Goal: {sleepGoal / 60}h/night</span>
            <span>
              Avg: {Math.floor(avgDuration / 60)}h {avgDuration % 60}m
            </span>
          </div>
        </DashboardCard>

        {/* Today's Log */}
        <DashboardCard className="mx-4 sm:mx-5 md:mx-8 mt-4 sm:mt-6" delay={0.3}>
          <h2 className="text-base sm:text-lg font-semibold mb-3">Recent Sleep Logs</h2>
          {sleepLogs
            .slice(-5)
            .reverse()
            .map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Moon className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500" />
                  </div>
                  <div>
                    <span className="text-sm sm:text-base font-medium">
                      {Math.floor(log.duration / 60)}h {log.duration % 60}m
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {log.bedtime} → {log.wakeTime}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${qualityColors[log.quality]}`}>
                  {log.quality}
                </span>
              </div>
            ))}
          {sleepLogs.length === 0 && (
            <p className="text-center text-muted-foreground py-4 text-sm">No sleep logged yet</p>
          )}
        </DashboardCard>
      </div>

      {/* Log Sleep Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-500" />
              Log Sleep
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1 mb-2">
                  <Sunset className="w-4 h-4 text-orange-500" />
                  Bedtime
                </Label>
                <Input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                />
              </div>
              <div>
                <Label className="flex items-center gap-1 mb-2">
                  <Sunrise className="w-4 h-4 text-amber-500" />
                  Wake Time
                </Label>
                <Input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label className="mb-2 block">Sleep Quality</Label>
              <div className="grid grid-cols-4 gap-2">
                {(['poor', 'fair', 'good', 'excellent'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium capitalize transition-all border ${
                      quality === q ? qualityColors[q] : 'border-border hover:bg-muted'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleLogSleep} className="w-full bg-indigo-500 hover:bg-indigo-600">
              <Clock className="w-4 h-4 mr-2" />
              Log Sleep
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Sleep Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Current goal: {sleepGoal / 60} hours per night
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[6, 7, 8, 9, 10, 11].map((hours) => (
                <Button
                  key={hours}
                  variant={sleepGoal === hours * 60 ? 'default' : 'outline'}
                  onClick={() => handleUpdateGoal(hours)}
                >
                  {hours}h
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
