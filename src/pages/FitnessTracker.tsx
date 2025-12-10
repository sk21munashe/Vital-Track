import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Dumbbell, Play, Clock, Flame, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { DashboardCard } from '@/components/DashboardCard';
import { ProgressRing } from '@/components/ProgressRing';
import { useWellnessData } from '@/hooks/useWellnessData';
import { activityTypes } from '@/data/foodDatabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function FitnessTracker() {
  const navigate = useNavigate();
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<typeof activityTypes[0] | null>(null);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const {
    profile,
    getTodayFitness,
    getTodayFitnessLogs,
    getWeekFitnessMinutes,
    addFitness,
    fitnessLogs,
  } = useWellnessData();

  const todayMinutes = getTodayFitness();
  const todayWorkouts = getTodayFitnessLogs();
  const weekMinutes = getWeekFitnessMinutes();
  const weekProgress = (weekMinutes / profile.goals.fitnessGoal) * 100;

  const handleAddWorkout = () => {
    if (!selectedActivity || !duration) return;

    const durationNum = parseInt(duration);
    const caloriesBurned = durationNum * selectedActivity.caloriesPerMinute;

    addFitness(selectedActivity.name, durationNum, caloriesBurned, notes);
    
    toast.success(`Workout logged! 💪`, {
      description: `${selectedActivity.name} for ${durationNum} mins • ${caloriesBurned} cal burned • +15 points`,
    });

    setShowAddWorkout(false);
    setSelectedActivity(null);
    setDuration('');
    setNotes('');
  };

  // Week data for chart
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = fitnessLogs.filter(log => log.date === dateStr);
    const total = dayLogs.reduce((sum, log) => sum + log.duration, 0);
    return {
      day: format(date, 'EEE'),
      minutes: total,
      isToday: i === 6,
    };
  });

  const maxMinutes = Math.max(...weekData.map(d => d.minutes), 60);

  return (
    <div className="h-full flex flex-col bg-background pb-4 overflow-y-auto">
      {/* Header */}
      <header className="pt-6 pb-4 px-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gradient-fitness">Fitness Tracker</h1>
            <p className="text-sm text-muted-foreground">Move your body, energize your life</p>
          </div>
        </div>
      </header>

      {/* Weekly Goal Card */}
      <DashboardCard className="mx-5 mb-6 glass-fitness">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-fitness" />
              <span className="font-semibold">Weekly Goal</span>
            </div>
            <p className="text-3xl font-bold text-fitness">
              {weekMinutes}
              <span className="text-lg font-normal text-muted-foreground ml-1">
                / {profile.goals.fitnessGoal} min
              </span>
            </p>
            <div className="w-full h-3 bg-fitness-light rounded-full mt-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(weekProgress, 100)}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-fitness rounded-full"
              />
            </div>
          </div>
          <ProgressRing
            progress={weekProgress}
            variant="fitness"
            label=""
            value={`${Math.round(weekProgress)}%`}
            size={90}
          />
        </div>
      </DashboardCard>

      {/* Today's Stats */}
      <div className="px-5 mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-fitness" />
          Today
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <DashboardCard className="text-center">
            <Clock className="w-6 h-6 mx-auto text-fitness mb-2" />
            <p className="text-2xl font-bold">{todayMinutes}</p>
            <p className="text-xs text-muted-foreground">minutes</p>
          </DashboardCard>
          <DashboardCard className="text-center">
            <Flame className="w-6 h-6 mx-auto text-fitness mb-2" />
            <p className="text-2xl font-bold">
              {todayWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0)}
            </p>
            <p className="text-xs text-muted-foreground">cal burned</p>
          </DashboardCard>
        </div>
      </div>

      {/* Activity Types */}
      <div className="px-5 mb-6">
        <h2 className="text-lg font-semibold mb-3">Log Activity</h2>
        <div className="grid grid-cols-5 gap-2">
          {activityTypes.slice(0, 10).map((activity) => (
            <motion.button
              key={activity.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedActivity(activity);
                setShowAddWorkout(true);
              }}
              className="p-3 rounded-2xl bg-fitness-light hover:bg-fitness/20 transition-colors flex flex-col items-center gap-1"
            >
              <span className="text-xl">{activity.icon}</span>
              <span className="text-xs font-medium truncate w-full text-center">
                {activity.name.split(' ')[0]}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Week Chart */}
      <DashboardCard className="mx-5 mb-6" delay={0.2}>
        <h2 className="text-lg font-semibold mb-4">This Week</h2>
        <div className="flex items-end justify-between h-32 gap-1">
          {weekData.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end h-24">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.minutes / maxMinutes) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className={`w-full rounded-t-lg ${
                    day.isToday ? 'bg-gradient-fitness' : 'bg-fitness/40'
                  }`}
                  style={{ minHeight: day.minutes > 0 ? '8px' : '0' }}
                />
              </div>
              <span className={`text-xs ${day.isToday ? 'font-bold text-fitness' : 'text-muted-foreground'}`}>
                {day.day}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
          <span>Daily avg: {Math.round(weekMinutes / 7)} min</span>
          <span>Total: {weekMinutes} min</span>
        </div>
      </DashboardCard>

      {/* Today's Workouts */}
      <DashboardCard className="mx-5" delay={0.3}>
        <h2 className="text-lg font-semibold mb-3">Today's Workouts</h2>
        {todayWorkouts.length > 0 ? (
          <div className="space-y-3">
            {todayWorkouts.map((workout) => (
              <div key={workout.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-fitness-light flex items-center justify-center">
                    <span className="text-lg">
                      {activityTypes.find(a => a.name === workout.activityType)?.icon || '🏃'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{workout.activityType}</p>
                    <p className="text-xs text-muted-foreground">
                      {workout.duration} min • {workout.caloriesBurned} cal
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{workout.time}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No workouts logged today</p>
            <Button
              onClick={() => setShowAddWorkout(true)}
              className="mt-3 bg-fitness hover:bg-fitness-dark"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Workout
            </Button>
          </div>
        )}
      </DashboardCard>

      {/* Add Workout Dialog */}
      <Dialog open={showAddWorkout} onOpenChange={setShowAddWorkout}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-fitness" />
              Log Workout
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Activity Selection */}
            <div>
              <Label>Activity Type</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {activityTypes.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className={`p-2 rounded-xl transition-colors flex flex-col items-center gap-1 ${
                      selectedActivity?.id === activity.id
                        ? 'bg-fitness text-white'
                        : 'bg-muted hover:bg-fitness-light'
                    }`}
                  >
                    <span className="text-lg">{activity.icon}</span>
                    <span className="text-[10px] truncate w-full text-center">
                      {activity.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                placeholder="e.g., 30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              {selectedActivity && duration && (
                <p className="text-sm text-muted-foreground mt-1">
                  Est. calories burned: <span className="text-fitness font-medium">
                    {parseInt(duration) * selectedActivity.caloriesPerMinute}
                  </span>
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="How was your workout?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <Button
              onClick={handleAddWorkout}
              className="w-full bg-fitness hover:bg-fitness-dark"
              disabled={!selectedActivity || !duration}
            >
              <Play className="w-4 h-4 mr-2" />
              Log Workout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
